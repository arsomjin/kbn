import { Form, Select, Skeleton } from "antd";
import { useMergeState } from "api/CustomHooks";
import PageTitle from "components/common/PageTitle";
import { ExpenseType } from "data/Constant";
import { StatusMap } from "data/Constant";
import { StatusMapToStep } from "data/Constant";
import { AccountSteps } from "data/Constant";
import { Stepper } from "elements";
import { getCollection } from "firebase/api";
import { getChanges } from "functions";
import { showSuccess } from "functions";
import { sortArrByMultiKeys } from "functions";
import { showWarn } from "functions";
import { load } from "functions";
import { getArrayChanges } from "functions";
import { createNewOrderId } from "Modules/Account/api";
import moment from "moment-timezone";
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { Container, Row, Col } from "shards-react";
import { FirebaseContext } from "../../../../firebase";
import DailyChange from "./Components/DailyChange";
import HeadOfficeTransfer from "./Components/HeadOfficeTransfer";
import ExecutiveExpenses from "./Components/ExecutiveExpenses";
import { errorHandler } from "functions";
import LeavePageBlocker from "components/LeavePageBlocker";

const initProps = {
  order: {},
  readOnly: false,
  onBack: null,
  isEdit: false,
  activeStep: 0,
  grant: true,
};

export default () => {
  const history = useHistory();
  let location = useLocation();
  const params = location.state?.params;

  //  showLog({ params });

  const { firestore, api } = useContext(FirebaseContext);
  const { user } = useSelector((state) => state.auth);
  const [mProps, setProps] = useMergeState(initProps);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState(params?.category || "dailyChange");
  const [expenseNames, setExpenseNames] = useState([]);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const getExpenseNames = async () => {
      let itArr = [];
      try {
        const cSnap = await getCollection("data/account/expenseName");
        if (!cSnap) {
          return setExpenseNames(itArr);
        }
        Object.keys(cSnap).map((k) => {
          let item = cSnap[k];
          item.expenseItemId = item._key;
          item.key = itArr.length + 1;
          itArr.push(item);
          return k;
        });
        //  showLog('expenseNames', itArr);
        itArr = sortArrByMultiKeys(itArr, [
          "expenseCategoryId",
          "expenseItemId",
        ]);
        setExpenseNames(itArr);
      } catch (e) {
        showWarn(e);
      }
    };
    getExpenseNames();
    api.getExpenseAccountNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { onBack } = params || {};
    let pOrder = params?.order;
    let isEdit =
      !!pOrder && !!pOrder.date && !!pOrder.created && !!pOrder.expenseId;
    const activeStep = !(pOrder && pOrder.date)
      ? 0
      : StatusMapToStep[pOrder.status || "pending"];
    const readOnly = onBack?.path
      ? onBack.path === "/reports/income-expense-summary"
      : false;
    const isInput = location.pathname === "/account/expense-input";

    if (!isEdit) {
      let expenseId = createNewOrderId("KBN-ACC-EXP");
      setProps({
        order: { expenseId },
        isEdit,
        activeStep,
        readOnly,
        onBack,
        isInput,
      });
    } else {
      setProps({
        order: pOrder,
        isEdit,
        activeStep,
        readOnly,
        onBack,
        isInput,
      });
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, category]);

  const _changeCategory = (ev) => {
    //  showLog('category', ev);
    setCategory(ev);
  };

  const _onConfirmOrder = async (values, resetToInitial) => {
    try {
      //  showLog('confirm_values', values);

      let mValues = JSON.parse(JSON.stringify(values));
      mValues.expenseCategory = "daily";
      mValues.expenseType = category;
      if (mProps.isEdit) {
        let changes = getChanges(mProps.order, values);
        if (mProps.order.items && values.items) {
          const itemChanges = getArrayChanges(mProps.order.items, values.items);
          if (itemChanges) {
            changes = [...changes, ...itemChanges];
          }
        }
        if (
          mProps.order?.changeDeposit &&
          Array.isArray(mProps.order.changeDeposit) &&
          values?.changeDeposit &&
          Array.isArray(values.changeDeposit)
        ) {
          const depositChanges = getArrayChanges(
            mProps.order.changeDeposit,
            values.changeDeposit
          );
          if (depositChanges) {
            changes = [...changes, ...depositChanges];
          }
        }
        mValues.editedBy = !!mProps.order.editedBy
          ? [
              ...mProps.order.editedBy,
              { uid: user.uid, time: Date.now(), changes },
            ]
          : [{ uid: user.uid, time: Date.now(), changes }];
      } else {
        mValues.created = moment().valueOf();
        mValues.inputBy = user.uid;
        mValues.inputDate = moment().format("YYYY-MM-DD");
        mValues.status = StatusMap.pending;
      }

      // PATCH: Only apply deduplication/transaction for dailyChange and create mode
      if (category === "dailyChange" && !mProps.isEdit) {
        const expensesRef = firestore
          .collection("sections")
          .doc("account")
          .collection("expenses");
        await firestore.runTransaction(async (transaction) => {
          const query = expensesRef
            .where("expenseType", "==", "dailyChange")
            .where("branchCode", "==", mValues.branchCode)
            .where("date", "==", mValues.date);
          const snapshot = await transaction.get(query);

          // Add uniqueKey to each item for deduplication
          mValues.items = (mValues.items || []).map((it) => ({
            ...it,
            uniqueKey: [
              it.expenseName,
              it.total,
              mValues.date,
              mValues.branchCode,
              it.priceType,
            ].join("|"),
          }));

          if (!snapshot.empty) {
            // Merge and deduplicate items by uniqueKey
            const doc = snapshot.docs[0];
            const existing = doc.data();
            let mergedItems = [...mValues.items, ...(existing.items || [])];
            mergedItems = mergedItems.filter(
              (item, idx, arr) =>
                arr.findIndex((i) => i.uniqueKey === item.uniqueKey) === idx
            );
            transaction.update(doc.ref, {
              ...existing,
              ...mValues,
              items: mergedItems,
              expenseId: existing.expenseId,
            });
            mValues.expenseId = existing.expenseId;
            mValues.items = mergedItems;
          } else {
            const newDocRef = expensesRef.doc(mValues.expenseId);
            transaction.set(newDocRef, mValues);
          }
        });
      } else {
        // ...existing code for edit or other categories...
        const expenseRef = firestore
          .collection("sections")
          .doc("account")
          .collection("expenses")
          .doc(mValues.expenseId);
        const docSnap = await expenseRef.get();
        if (docSnap.exists) {
          expenseRef.update(mValues);
        } else {
          expenseRef.set(mValues);
        }
      }
      // Record log.
      api.addLog(
        mProps.isEdit
          ? {
              time: Date.now(),
              type: "edited",
              by: user.uid,
              docId: mValues.expenseId,
            }
          : {
              time: Date.now(),
              type: "created",
              by: user.uid,
              docId: mValues.expenseId,
            },
        "expenses",
        "daily"
      );
      load(false);
      setSaved(true);
      showSuccess(
        () => {
          if (mProps.isEdit) {
            history.push(mProps.onBack.path, { params: mProps.onBack });
          } else {
            let expenseId = createNewOrderId("KBN-ACC-EXP");
            resetToInitial();
            setProps({ ...initProps, order: { expenseId } });
          }
        },
        mValues.expenseNo
          ? `บันทึกข้อมูลเลขที่ ${mValues.expenseNo} สำเร็จ`
          : "บันทึกข้อมูลสำเร็จ",
        true
      );
    } catch (e) {
      showWarn(e);
      errorHandler({
        code: e?.code || "",
        message: e?.message || "",
        snap: { ...values, module: "Expense" },
      });
    }
  };

  const _setUnsaved = () => setSaved(false);

  let currentView = (
    <DailyChange
      isEdit={mProps.isEdit}
      expenseType={category}
      onConfirm={_onConfirmOrder}
      order={mProps.order}
      readOnly={mProps.readOnly}
      onBack={mProps.onBack}
      setUnsaved={_setUnsaved}
    />
  );

  switch (category) {
    case "dailyChange":
      currentView = (
        <DailyChange
          isEdit={mProps.isEdit}
          expenseType={category}
          onConfirm={_onConfirmOrder}
          order={mProps.order}
          readOnly={mProps.readOnly}
          onBack={mProps.onBack}
          setUnsaved={_setUnsaved}
        />
      );
      break;
    case "headOfficeTransfer":
      currentView = (
        <HeadOfficeTransfer
          isEdit={mProps.isEdit}
          expenseType={category}
          onConfirm={_onConfirmOrder}
          order={mProps.order}
          readOnly={mProps.readOnly}
          onBack={mProps.onBack}
          expenseNames={expenseNames}
          setUnsaved={_setUnsaved}
        />
      );
      break;
    case "executive":
      currentView = (
        <ExecutiveExpenses
          isEdit={mProps.isEdit}
          expenseType={category}
          onConfirm={_onConfirmOrder}
          order={mProps.order}
          readOnly={mProps.readOnly}
          onBack={mProps.onBack}
          expenseNames={expenseNames}
          setUnsaved={_setUnsaved}
        />
      );

      break;
    default:
      break;
  }

  return (
    <>
      <LeavePageBlocker
        when={!saved}
        message="มีข้อมูลที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้โดยไม่บันทึกข้อมูล?"
      />
      <Container fluid className="main-content-container p-3">
        <Row noGutters className="page-header px-3 bg-light">
          <PageTitle
            sm="4"
            title="รายจ่าย"
            subtitle="บัญชี"
            className="text-sm-left"
          />
          {mProps.isInput && (
            <Col>
              <Stepper
                className="bg-light"
                steps={AccountSteps}
                activeStep={mProps.activeStep}
                alternativeLabel={false} // In-line labels
              />
            </Col>
          )}
        </Row>
        <div className="px-3 pt-3 bg-white border-bottom">
          <Row style={{ alignItems: "center" }}>
            <Col md="4">
              <Form.Item label="ประเภทการจ่ายเงิน">
                <Select
                  placeholder="ประเภทการจ่ายเงิน"
                  onChange={(ev) => _changeCategory(ev)}
                  value={category}
                  className="text-primary"
                  disabled={!mProps.grant || mProps.isEdit}
                >
                  {Object.keys(ExpenseType).map((type, i) => (
                    <Select.Option
                      key={i}
                      value={type}
                    >{`${ExpenseType[type]}`}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
        {ready ? currentView : <Skeleton active />}
      </Container>
    </>
  );
};
