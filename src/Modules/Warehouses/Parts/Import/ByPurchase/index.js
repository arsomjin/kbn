import React, { useCallback, useContext, useState } from 'react';
import { Container, Row } from 'shards-react';
import { Form } from 'antd';
import { Button } from 'elements';
import {
  showMessageBar,
  arrayForEach,
  showSuccess,
  showConfirm,
  showWarn,
  load,
  sortArr,
  errorHandler,
  cleanValuesBeforeSave,
  showAlert,
  firstKey
} from 'functions';
import moment from 'moment';
import ImportList from './ImportList';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../../../../firebase';
import PageTitle from 'components/common/PageTitle';
import { useMergeState } from 'api/CustomHooks';
import { CheckOutlined, DownloadOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router';
import ItemList from './ItemList';
import { initialValues, initialItemValues, renderHeader } from './api';
import { Markers } from 'data/Constant';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import { createNewId } from 'utils';
import { createBillNoSKCKeywords } from 'Modules/Utils';
import { checkCollection } from 'firebase/api';
import { getNameFromUid, getNameFromEmployeeCode } from 'Modules/Utils';

const StockImportByPurchase = ({}) => {
  const { users, employees } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const initMergeState = {
    mVpNo: null,
    mBillSKC: null,
    mPurchaseDoc: null,
    showUpload: false,
    noItemChecked: false,
    noItemAdded: false
  };
  const { firestore, api } = useContext(FirebaseContext);
  const [filteredData, setFData] = useState([]);
  const [items, setItems] = useState([{ ...initialItemValues, id: 0, key: 0 }]);
  const [seller, setSeller] = useState('siamKubota');
  const [selects, setSelects] = useState([]);
  const [reset, setReset] = useState(false);
  const [forceValidate, setForceValidate] = useState(null);
  const [inputType, setInputType] = useState('importFromFile');
  const [cState, setCState] = useMergeState(initMergeState);

  const history = useHistory();
  const [form] = Form.useForm();

  const _onValuesChange = async val => {
    try {
      let changeKey = firstKey(val);
      if (changeKey === 'billNoSKC') {
        let snap = await checkCollection('sections/stocks/importParts', [
          ['billNoSKC', '==', val[changeKey]]
          // ['warehouseChecked', '!=', null],
        ]);
        if (snap) {
          let arr = [];
          let warehouseNotCheckedArr = [];
          let warehouseCheckedArr = [];
          let accountCheckedArr = [];
          snap.forEach(doc => {
            let sItem = doc.data();
            sItem._key = doc.id;
            sItem.key = doc.id;
            arr.push(sItem);

            if (!!doc.data().accountChecked) {
              accountCheckedArr.push(sItem);
            }
            if (!!doc.data().warehouseChecked) {
              warehouseCheckedArr.push(sItem);
            } else {
              warehouseNotCheckedArr.push(sItem);
            }
          });

          // Check document.
          if (warehouseNotCheckedArr.length === 0) {
            showAlert(
              'ตรวจรับสินค้าแล้ว',
              `ฝ่ายคลังสินค้า ตรวจรับสินค้าแล้ว ${
                !!warehouseCheckedArr[0].warehouseCheckedDate
                  ? `เมื่อวันที่ ${moment(warehouseCheckedArr[0].warehouseCheckedDate, 'YYYY-MM-DD').format(
                      'D/MM/YYYY'
                    )}`
                  : ''
              } ${
                !!warehouseCheckedArr[0].warehouseCheckedBy
                  ? `โดยคุณ ${getNameFromEmployeeCode({
                      employeeCode: warehouseCheckedArr[0].warehouseCheckedBy,
                      employees
                    })}`
                  : ''
              }`
            );
            return;
          }
          if (accountCheckedArr.length === arr.length) {
            showAlert(
              'บันทึกราคาสินค้าแล้ว',
              `ฝ่ายบัญชีบันทึกราคาสินค้าแล้ว ${
                !!accountCheckedArr[0].accountCheckedDate
                  ? `เมื่อวันที่ ${moment(accountCheckedArr[0].accountCheckedDate, 'YYYY-MM-DD').format('D/MM/YYYY')}`
                  : ''
              } ${
                !!accountCheckedArr[0].accountCheckedBy
                  ? `โดยคุณ ${getNameFromUid({
                      uid: accountCheckedArr[0].accountCheckedBy,
                      users,
                      employees
                    })}`
                  : ''
              }`,
              'warning'
            );
            return;
          }

          warehouseNotCheckedArr = warehouseNotCheckedArr.map((item, id) => ({
            ...item,
            id
          }));
          let mArr = JSON.parse(JSON.stringify(warehouseNotCheckedArr));
          // showLog('mArr', mArr);
          mArr = sortArr(mArr, 'time');
          mArr = mArr.map((od, id) => ({
            ...od,
            id
          }));
          mArr.length > 0 &&
            mArr[0]?.docDate &&
            form.setFieldsValue({
              invoiceDate: mArr[0].docDate
            });
          setFData(mArr);
          setCState({
            mBillSKC: val[changeKey],
            mPurchaseDoc: null,
            mVpNo: null
          });
        }
      }
    } catch (e) {
      showWarn(e);
    }
  };

  const resetToInitial = useCallback(
    seller => {
      setCState(initMergeState);
      setFData([]);
      setSelects([]);
      setItems([{ ...initialItemValues, id: 0, key: 0 }]);
      form.resetFields();
      setReset(rs => !rs);
      // if (seller !== 'store') {
      //   _getData();
      // }
      form.setFieldsValue({ seller });
      setInputType(seller !== 'store' ? 'importFromFile' : 'manualInput');
    },
    [form, initMergeState, setCState]
  );

  const onSellerSelect = useCallback(
    sl => {
      // showLog({ sl });
      setSeller(sl);
      resetToInitial(sl);
    },
    [resetToInitial]
  );

  const onSelect = sl => {
    setSelects(sl);
    if (cState.noItemChecked && sl.length > 0) {
      setCState({ noItemChecked: false });
    }
  };

  const onDeleteItem = dKey => {
    let nData = [...filteredData];
    let idx = nData.findIndex(l => l.key === dKey);
    if (idx > -1) {
      nData[idx].deleted = true;
      setFData(nData);
      setSelects(selects.filter(l => l !== dKey));
    }
  };

  const onInputTypeChange = e => {
    let itype = e.target.value;
    setInputType(itype);
  };

  const onUpdateItems = useCallback(arr => {
    setItems(arr);
  }, []);

  const confirmUpdate = async (row, mItems) => {
    try {
      // return showLog({ selects, row });
      // Update data. (warehouseChecked: timestamp, warehouseCheckedBy, seller, invoiceDate, warehouseReceiveDate)
      load(true);
      switch (inputType) {
        case 'importFromFile':
          if (selects.length > 0) {
            await arrayForEach(selects, async k => {
              await firestore
                .collection('sections')
                .doc('stocks')
                .collection('importParts')
                .doc(k)
                .update({
                  warehouseChecked: Date.now(),
                  warehouseCheckedDate: moment().format('YYYY-MM-DD'),
                  warehouseCheckedBy: row.warehouseCheckedBy,
                  warehouseInputBy: user.uid,
                  seller: row.seller,
                  invoiceDate: moment(row.invoiceDate).format('YYYY-MM-DD'),
                  warehouseReceiveDate: moment(row.warehouseReceiveDate).format('YYYY-MM-DD')
                });
            });
          }
          let deletedArr = filteredData.filter(l => l.deleted);
          if (deletedArr.length > 0) {
            await arrayForEach(deletedArr, async it => {
              await firestore
                .collection('sections')
                .doc('stocks')
                .collection('importParts')
                .doc(it.key)
                .update({ deleted: true });
            });
          }
          load(false);
          showSuccess(
            () => {
              // Reset all by reload page.
              // history.go(0);
              // Reset to initial.
              resetToInitial(row.seller);
            },
            `บันทึกรายการตรวจสอบ เรียบร้อยแล้ว`,
            true
          );
          break;
        default:
          await arrayForEach(mItems, async (it, i) => {
            let mItem = JSON.parse(JSON.stringify(it));
            delete mItem.id;
            delete mItem.key;
            let _key = createNewId('IMP-PAR');
            _key = `${_key.slice(0, -1)}${i}`;
            let uItem = cleanValuesBeforeSave({
              ...mItem,
              warehouseInputBy: user.uid,
              ...Markers.purchaseTransferPayment,
              importBy: user.uid,
              importTime: Date.now(),
              _key
            });

            await firestore.collection('sections').doc('stocks').collection('importParts').doc(_key).set(uItem);
          });
          load(false);
          showSuccess(
            () => {
              resetToInitial(row.seller);
            },
            `บันทึกรายการ เรียบร้อยแล้ว`,
            true
          );
          break;
      }
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: { module: 'ImportPartsByPurchase', inputType }
      });
    }
  };

  const onFinish = async () => {
    try {
      const row = await form.validateFields();
      //  showLog({ row });
      switch (inputType) {
        case 'importFromFile':
          //  showLog({ selects });
          if (selects.length === 0 && filteredData.filter(l => l.deleted).length === 0) {
            // No item has checked.
            setCState({ noItemChecked: true });
            return showMessageBar('กรุณาตรวจสอบข้อมูล', 'ยังไม่มีรายการที่ตรวจสอบ', 'warning');
          }
          showConfirm(
            () => confirmUpdate(row),
            `การตรวจสอบ ${selects.length + filteredData.filter(l => l.deleted).length} รายการ`
          );

          break;
        default:
          //  showLog({ items });
          // Check items completeness.
          let nItems = [];
          let errors = [];
          await arrayForEach(items, async it => {
            if (
              !(
                it.pCode &&
                it.productName &&
                it.partLocationCode &&
                it.unit &&
                it.branchCode &&
                it.dealer &&
                it.import &&
                it.inputDate
              )
            ) {
              errors.push(it.id);
            } else {
              let mItem = JSON.parse(JSON.stringify(it));
              mItem = {
                ...initialItemValues,
                ...it,
                warehouseChecked: Date.now(),
                warehouseCheckedDate: moment().format('YYYY-MM-DD'),
                warehouseCheckedBy: row.warehouseCheckedBy,
                seller: row.seller,
                invoiceDate: moment(row.invoiceDate).format('YYYY-MM-DD'),
                warehouseReceiveDate: moment(row.warehouseReceiveDate).format('YYYY-MM-DD'),
                inputDate: moment(mItem.inputDate).format('YYYY-MM-DD'),
                receiveNo: row.receiveNo,
                docNo: row.receiveNo,
                purchaseNo: row.purchaseNo,
                ...(!!row.receiveNo && {
                  keywords: createBillNoSKCKeywords(row.receiveNo)
                })
              };
              nItems.push(mItem);
            }
          });
          if (errors.length === 0) {
            setForceValidate(null);
            showConfirm(() => confirmUpdate(row, nItems), `การรับสินค้า ${nItems.length} รายการ`);
          } else {
            showMessageBar('กรุณาตรวจสอบข้อมูล', `กรุณาตรวจสอบข้อมูล แถวที่ ${Number(errors[0]) + 1}`, 'warning');
            setForceValidate(Number(errors[0]) + 1);
          }
          break;
      }
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Row form className="page-header pb-3 px-3 align-items-center">
        <PageTitle sm="4" title="อะไหล่" subtitle="รับสินค้าจากการซื้อ" className="text-sm-left" />
      </Row>
      <Form
        form={form}
        layout="vertical"
        // onFinish={onFinish}
        onValuesChange={_onValuesChange}
        initialValues={initialValues}
        style={{ alignItems: 'center' }}
        size="small"
      >
        {values => {
          // showLog({ values, filteredData, selects });
          return (
            <>
              {renderHeader({
                form,
                onSellerSelect,
                // onBillSelect,
                // onPOSelect,
                seller,
                // billOptions,
                // PO_Options,
                cState,
                inputType,
                onInputTypeChange
              })}
              {inputType === 'importFromFile' ? (
                <ImportList
                  originData={filteredData}
                  onSelect={onSelect}
                  onDelete={onDeleteItem}
                  noItemChecked={cState.noItemChecked}
                  reset={reset}
                />
              ) : (
                <ItemList
                  originData={items}
                  onSubmit={onUpdateItems}
                  mainForm={form}
                  noItemAdded={cState.noItemAdded}
                  forceValidate={forceValidate}
                />
              )}
              <div className="d-flex flex-column align-items-end">
                <Form.Item
                  name="warehouseCheckedBy"
                  label="ตรวจรับสินค้าโดย"
                  rules={getRules(['required'])}
                  className="d-flex flex-row justify-content-end mr-4 pr-4"
                >
                  <EmployeeSelector
                    disabled={
                      selects.length === 0 &&
                      filteredData.filter(l => l.deleted).length === 0 &&
                      inputType === 'importFromFile'
                    }
                    className="ml-4"
                    style={{ minWidth: 200 }}
                  />
                </Form.Item>
              </div>
            </>
          );
        }}
      </Form>
      <div className="border-bottom bg-white p-3 text-right">
        {inputType === 'importFromFile' && (
          <Button
            onClick={() =>
              history.push('/utils/upload-data-from-excel-file', {
                params: { dataType: 'parts' }
              })
            }
            className="mr-2 my-2"
            icon={<DownloadOutlined />}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            นำเข้ารายการรับอะไหล่ จากระบบ SKC
          </Button>
        )}
        <Button
          onClick={onFinish}
          type="primary"
          icon={<CheckOutlined />}
          className="mr-2 my-2"
          disabled={
            selects.length === 0 && filteredData.filter(l => l.deleted).length === 0 && inputType === 'importFromFile'
          }
        >
          {inputType !== 'importFromFile' ? 'ยืนยัน' : 'ยืนยันการตรวจสอบ'}
        </Button>
      </div>
    </Container>
  );
};

export default StockImportByPurchase;
