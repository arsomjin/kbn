import React from 'react';
import { Form } from 'antd';
import { getRules } from 'api/Table';
import DepartmentSelector from 'components/DepartmentSelector';
import EmployeeSelector from 'components/EmployeeSelector';
import ExpenseNameSelector from 'components/ExpenseNameSelector';
import ExpenseCategorySelector from 'components/ExpenseCategorySelector';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { ExpenseType } from 'data/Constant';
import { Input, InputGroup } from 'elements';
import numeral from 'numeral';
import { Row, Col } from 'shards-react';
import HiddenItem from 'components/HiddenItem';
import DealerSelector from 'components/DealerSelector';
import { Numb } from 'functions';
import ComingSoon from 'views/ComingSoon';
import { Switch } from 'elements';
import { showLog } from 'functions';
import { checkDoc } from 'firebase/api';
import { checkCollection } from 'firebase/api';
import { checkExistingExpense } from '../../api';
import BranchSelector from 'components/BranchSelector';
import { distinctArr } from 'functions';
import { PageSummary } from 'api';
export const renderInput = ({ values, grant, user, readOnly }) => {
  // showLog({ values });
  return (
    <div className="bg-white">
      <HiddenItem name="balance" />
      <HiddenItem name="VAT" />
      <Row>
        <Col md="6">
          <Form.Item name="payer" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="พนักงานผู้เบิกเงิน"
              inputComponent={props => <EmployeeSelector disabled={!grant || readOnly} hasStatusColor {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="payToBranch" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="จ่ายให้สาขา"
              inputComponent={props => (
                <BranchSelector placement="bottomRight" disabled={!grant || readOnly} {...props} />
              )}
              primary
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="expenseCategoryId" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="หมวดรายจ่าย"
              inputComponent={props => (
                <ExpenseCategorySelector
                  placement="bottomRight"
                  disabled={!grant || readOnly}
                  noAddable={!user.isDev}
                  {...props}
                />
              )}
              primary
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="expenseAccountNameId" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ชื่อบัญชี"
              inputComponent={props => <ExpenseNameSelector record={values} disabled={!grant || readOnly} {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="expenseName" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="รายการ" disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="department" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="แผนก"
              inputComponent={props => <DepartmentSelector disabled={!grant || readOnly} {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="total" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 10, 4]}
              addonBefore="รายจ่าย"
              addonAfter="บาท"
              alignRight
              currency
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="priceType" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ประเภทราคา"
              inputComponent={props => (
                <PriceTypeSelector style={{ width: '100%' }} disabled={!grant || readOnly} {...props} />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="taxInvoiceNo">
            <InputGroup spans={[10, 14]} addonBefore="เลขที่บิล" alignRight disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="dealer">
            <InputGroup
              spans={[10, 14]}
              addonBefore="ชื่อผู้จำหน่าย"
              inputComponent={props => (
                <DealerSelector disabled={!grant || readOnly} placement="bottomRight" {...props} />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Form.Item name="isChevrolet">
            <InputGroup
              spans={[10, 14]}
              addonBefore="รายจ่าย เชฟโรเลต"
              inputComponent={props => (
                <Switch style={{ marginLeft: '10px' }} disabled={!grant || readOnly} {...props} />
              )}
            />
          </Form.Item>
        </Col>
        <Col md="8" className="d-flex flex-row ">
          <label className="mr-3">หมายเหตุ:</label>
          <Form.Item name="remark" style={{ width: '100%' }}>
            <Input placeholder="หมายเหตุ" disabled={!grant} readOnly={readOnly} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export const renderSummary = (data, form, branches, payByOther) => {
  // showLog({ summary_data: data, payByOther });
  const fData = data.filter(l => !l.deleted);
  const fPayByOther = payByOther.filter(l => !l.deleted);
  const total = fData.reduce((sum, elem) => sum + Numb(elem?.total), 0);
  const changeDeposit = form.getFieldValue('changeDeposit') || [];
  const totalDeposit = Array.isArray(changeDeposit)
    ? changeDeposit.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0)
    : changeDeposit;
  const payToBranchArr =
    fData.length > 0
      ? distinctArr(fData, ['payToBranch'], ['total']).map(l => ({
          item: branches[l.payToBranch].branchName,
          value: l.total
        }))
      : [];
  const payByOtherArr =
    fPayByOther.length > 0
      ? distinctArr(fPayByOther, ['branchCode'], ['total']).map(l => ({
          item: branches[l.branchCode].branchName,
          value: l.total
        }))
      : [];

  const totalOther = fPayByOther.reduce((sum, elem) => sum + Numb(elem?.total), 0);

  const sumData = [
    {
      item: `รายรับ${ExpenseType['dailyChange']} ทั้งสิ้น`,
      value: numeral(totalDeposit).format('0,0.00'),
      text: 'primary'
    },
    ...payToBranchArr,
    {
      item: 'รวมรายจ่ายประจำวันสาขา',
      value: numeral(total).format('0,0.00'),
      text: 'primary'
    },
    {
      item: 'คงเหลือสุทธิ',
      value: numeral(Number(totalDeposit) - total).format('0,0.00'),
      text: 'primary'
    }
  ];

  const sumData2 = [
    ...payByOtherArr,
    {
      item: 'รวมสาขาอื่นจ่ายให้',
      value: numeral(totalOther).format('0,0.00'),
      text: 'primary'
    },
    {
      item: 'รวมรายจ่ายทั้งสิ้น',
      value: numeral(total + totalOther).format('0,0.00'),
      text: 'primary'
    }
  ];

  return (
    <Row>
      <Col>
        <PageSummary title={`สรุปรายการรับ${ExpenseType['dailyChange']} รายการจ่ายเงิน`} data={sumData} />
      </Col>
      <Col>
        <PageSummary title="สาขาอื่นจ่ายให้" data={sumData2} />
      </Col>
    </Row>
  );
};

export const renderChevrolet = (values, grant, readOnly) => {
  return (
    <div className="bg-white">
      <HiddenItem name="balance" />
      <HiddenItem name="VAT" />
      <ComingSoon isSection inProgress />
    </div>
  );
};

export const columns = [
  {
    title: 'ลำดับ',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'พนักงานผู้เบิกเงิน',
    dataIndex: 'payer',
    ellipsis: true,
    required: true
  },
  {
    title: 'จ่ายให้สาขา',
    dataIndex: 'payToBranch',
    ellipsis: true,
    required: true
  },
  {
    title: 'หมวดรายจ่าย',
    dataIndex: 'expenseCategoryId',
    ellipsis: true,
    required: true
  },
  {
    title: 'ชื่อบัญชี',
    dataIndex: 'expenseAccountNameId',
    ellipsis: true,
    required: true
  },
  {
    title: 'รายการ',
    dataIndex: 'expenseName',
    required: true
  },
  {
    title: 'แผนก',
    dataIndex: 'department',
    required: true
  },
  {
    title: 'รายจ่าย',
    dataIndex: 'total',
    number: true,
    required: true
  },
  {
    title: 'ประเภทราคา',
    dataIndex: 'priceType',
    required: true
  },
  {
    title: 'คงเหลือ',
    dataIndex: 'balance',
    align: 'right',
    required: true
  },
  {
    title: 'เลขที่บิล',
    dataIndex: 'taxInvoiceNo',
    editable: true
    // required: true,
  },
  {
    title: 'ชื่อผู้จำหน่าย',
    dataIndex: 'dealer',
    editable: true
    // required: true,
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark',
    editable: true
  }
];

export const initValues = {
  expenseId: null,
  branchCode: null,
  date: undefined,
  changeDeposit: [],
  expenseType: 'dailyChange',
  total: null,
  billTotal: null,
  receiverEmployee: null
};

export const initItemValues = {
  payer: null,
  payToBranch: null,
  expenseCategoryId: null,
  expenseName: null,
  total: null,
  balance: null,
  expenseAccountNameId: null,
  VAT: null,
  discount: null,
  dealer: null,
  department: null,
  remark: null,
  priceType: 'includeVat',
  taxInvoiceNo: null,
  isChevrolet: false
};

export const getInitValues = order => {
  if (order?.created) {
    return order;
  }
  return {
    ...initValues,
    expenseId: order?.expenseId
  };
};

export const getInitItem = (item, payToBranch) => {
  if (item) {
    return item;
  }
  return { ...initItemValues, payToBranch };
};

export const getOtherBranchPay = async (branchCode, date) =>
  new Promise(async (r, j) => {
    try {
      let expenseItems = [];
      const snap = await checkCollection('sections/account/expenses', [
        ['expenseType', '==', 'dailyChange'],
        ['branchCode', '!=', branchCode],
        ['date', '==', date]
      ]);
      if (snap) {
        snap.forEach(doc => {
          const items = doc.data()?.items || [];
          let arr = items.map(it => ({
            ...it,
            branchCode: doc.data().branchCode,
            expenseId: doc.data().expenseId
          }));
          expenseItems = expenseItems.concat(arr);
        });
      }
      // showLog({ expenseItems });
      r(expenseItems.filter(l => l.payToBranch === branchCode));
    } catch (e) {
      j(e);
    }
  });

export const handleUpdate = (filters, nProps, user) =>
  new Promise(async (r, j) => {
    const { branchCode, date } = filters;
    try {
      let expense = {};
      if (!date || !branchCode) {
        r(false);
        return showLog('NO_DATE_AND_BRANCH_SELECTED');
      }
      // Get expense object.
      if (nProps.isEdit) {
        const doc = await checkDoc('sections', `account/expenses/${filters.expenseId}`);
        if (doc) {
          expense = doc.data();
        }
      } else {
        let wheres = [
          ['expenseType', '==', 'dailyChange'],
          ['branchCode', '==', branchCode],
          ['date', '==', date]
        ];
        expense = await checkExistingExpense(wheres);
      }

      if (!expense?.expenseId) {
        // No existing expense data.
        r(false);
        return showLog('NO_EXISTING_EXPENSE_DATA');
      }
      let expenseId = expense.expenseId;
      let expenseItems = [];

      let changeDeposit =
        expense?.changeDeposit && Array.isArray(expense.changeDeposit)
          ? expense.changeDeposit
          : [
              {
                total: expense.changeDeposit,
                by: user.uid,
                time: Date.now()
              }
            ];
      let receiverEmployee = expense.receiverEmployee;
      let editedBy = expense.editedBy || null;

      let prevBalance = changeDeposit.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0);
      if (expense?.items) {
        expenseItems = expense.items.map((it, i) => {
          let balance = prevBalance - Numb(it.total);
          prevBalance = balance;
          return {
            ...it,
            id: i,
            key: i,
            balance
          };
        });
      } else {
        let wheres2 = [
          ['expenseId', '==', expenseId],
          ['branchCode', '==', nProps.isEdit ? branchCode : expense.branchCode],
          ['date', '==', nProps.isEdit ? date : expense.date]
        ];
        const itemSnap = await checkCollection('sections/account/expenseItems', wheres2);
        if (itemSnap) {
          itemSnap.forEach(doc => {
            let balance = prevBalance - Numb(doc.data().total);
            prevBalance = balance;
            expenseItems.push({
              ...doc.data(),
              _key: doc.id,
              id: expenseItems.length,
              key: expenseItems.length,
              balance
            });
          });
          // showLog({ expenseItems });
        }
      }

      expenseItems = expenseItems.map(it => ({
        ...it,
        payToBranch: it?.payToBranch || branchCode
      }));
      const otherBranchPay = await getOtherBranchPay(branchCode, date);

      const total = expenseItems.reduce((sum, elem) => sum + Numb(elem?.total), 0);
      const totalDeposit = changeDeposit.filter(l => !l.deleted).reduce((sum, elem) => sum + Numb(elem.total), 0);

      r({
        expenseId,
        expenseItems,
        changeDeposit,
        receiverEmployee,
        total,
        editedBy,
        totalDeposit,
        otherBranchPay
      });
    } catch (e) {
      j(e);
    }
  });
