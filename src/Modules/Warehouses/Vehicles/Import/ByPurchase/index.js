import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'shards-react';
import { Form } from 'antd';
import { Button } from 'elements';
import { showMessageBar, arrayForEach, showSuccess, showConfirm, showWarn } from 'functions';
import moment from 'moment';
import ImportList from './ImportList';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../../../../firebase';
import PageTitle from 'components/common/PageTitle';
import { useMergeState } from 'api/CustomHooks';
import { CheckOutlined, DownloadOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router';
import ItemList from './ItemList';
import { getBillOptions, getPoOptions, getVpNumOptions } from 'api/Input';
import { getWarehouseCheckedData, initialValues, initialItemValues, renderHeader } from './api';
import { Markers } from 'data/Constant';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import { load, cleanValuesBeforeSave } from 'functions';
import { errorHandler } from 'functions';
import Toggles from 'components/Toggles';
import { firstKey } from 'functions';
import { createNewId } from 'utils';
import { createBillNoSKCKeywords } from 'Modules/Utils';

const StockImportByPurchase = ({}) => {
  const { users } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const disableAllBranches = true;
  const initialBranch = users[user.uid]?.branch || disableAllBranches ? '0450' : 'all';
  const initMergeState = {
    mVpNo: null,
    mBillSKC: null,
    mPurchaseDoc: null,
    showUpload: false,
    noItemChecked: false,
    noItemAdded: false
  };
  const { firestore, api } = useContext(FirebaseContext);
  const [data, setData] = useState([]);
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

  const _getData = useCallback(async () => {
    try {
      const stockImportArr = await getWarehouseCheckedData(firestore);
      //  showLog({ stockImportArr });
      setData(stockImportArr);
    } catch (e) {
      showWarn(e);
    }
  }, [firestore]);

  useEffect(() => {
    _getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetToInitial = useCallback(
    seller => {
      setCState(initMergeState);
      setFData([]);
      setSelects([]);
      setItems([{ ...initialItemValues, id: 0, key: 0 }]);
      form.resetFields();
      setReset(rs => !rs);
      if (seller !== 'store') {
        _getData();
      }
      form.setFieldsValue({ seller });
      setInputType(seller !== 'store' ? 'importFromFile' : 'manualInput');
    },
    [_getData, form, initMergeState, setCState]
  );

  const onSellerSelect = useCallback(
    sl => {
      // showLog({ sl });
      setSeller(sl);
      resetToInitial(sl);
    },
    [resetToInitial]
  );

  const onBillSelect = useCallback(
    bl => {
      let fData = data.filter(l => l.billNoSKC === bl.value);
      fData = fData.map((it, i) => ({ ...it, id: i }));
      fData.length > 0 &&
        fData[0]?.docDate &&
        form.setFieldsValue({
          invoiceDate: fData[0].docDate
        });
      setFData(fData);
      setCState({ mBillSKC: bl, mPurchaseDoc: null, mVpNo: null });
    },
    [data, form, setCState]
  );

  const onPOSelect = useCallback(
    bl => {
      let fData = data.filter(l => l.purchaseNo === bl.value);
      fData = fData.map((it, i) => ({ ...it, id: i }));
      setFData(fData);
      setCState({ mPurchaseDoc: bl, mBillSKC: null, mVpNo: null });
    },
    [data, setCState]
  );

  const onVpNumSelect = useCallback(
    vp => {
      //  showLog({ vp });
      let fData = data.filter(l => l.key === vp.value);
      fData = fData.map((it, i) => ({ ...it, id: i }));
      setFData(fData);
      setCState({ mVpNo: vp, mBillSKC: null, mPurchaseDoc: null });
    },
    [data, setCState]
  );

  const onSelect = sl => {
    //  showLog(sl);
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

  const _onValuesChange = val => {
    if (firstKey(val) === 'isUsed') {
      let mItems = [...items].map(it => ({ ...it, isUsed: val['isUsed'] }));
      //  showLog({ val, mItems });
      setItems(mItems);
    }
  };

  const confirmUpdate = async (value, mItems) => {
    try {
      // Update data. (warehouseChecked: timestamp, warehouseCheckedBy, seller, invoiceDate, warehouseReceiveDate)
      load(true);
      const row = cleanValuesBeforeSave(value);
      switch (inputType) {
        case 'importFromFile':
          if (selects.length > 0) {
            await arrayForEach(selects, async k => {
              await firestore
                .collection('sections')
                .doc('stocks')
                .collection('importVehicles')
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
                .collection('importVehicles')
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
            let uItem = cleanValuesBeforeSave({
              ...mItem,
              warehouseInputBy: user.uid,
              ...Markers.purchaseTransferPayment,
              importBy: user.uid,
              importTime: Date.now()
            });
            let _key = createNewId('IMP-VEH');
            _key = `${_key.slice(0, -1)}${i}`;
            await firestore
              .collection('sections')
              .doc('stocks')
              .collection('importVehicles')
              .doc(_key)
              .set({ ...uItem, _key });
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
          // Check items completeness.
          let nItems = [];
          let errors = [];
          let mItems = items.filter(l => l.branchCode && l.productCode);
          await arrayForEach(mItems, async it => {
            if (
              !(
                it.productCode &&
                it.productName &&
                it.storeLocationCode &&
                it.unit &&
                it.branchCode &&
                it.dealer &&
                it.import &&
                it.inputDate &&
                (it.vehicleNo || it.peripheralNo)
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
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          inputType,
          module: 'ImportVehiclesByPurchase'
        }
      });
    }
  };

  const PO_Options = getPoOptions(data, ['purchaseNo']);
  const billOptions = getBillOptions(data, ['billNoSKC']);
  const VpNumOptions = getVpNumOptions(data, ['vehicleNo', 'peripheralNo']);

  return (
    <Container fluid className="main-content-container p-3">
      <Row form className="page-header pb-3 px-3 align-items-center">
        <PageTitle sm="4" title="รถและอุปกรณ์" subtitle="รับสินค้าจากการซื้อ" className="text-sm-left" />
      </Row>
      <Form
        form={form}
        layout="vertical"
        // onFinish={onFinish}
        initialValues={initialValues}
        style={{ alignItems: 'center' }}
        size="small"
        onValuesChange={_onValuesChange}
      >
        {renderHeader({
          form,
          onSellerSelect,
          onBillSelect,
          onPOSelect,
          onVpNumSelect,
          seller,
          billOptions,
          PO_Options,
          VpNumOptions,
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
          <div className="pt-3">
            <Row>
              <Col md="2">
                <h6 className="ml-3">ประเภทสินค้า</h6>
              </Col>
              <Col md="4">
                <Form.Item name="isUsed">
                  <Toggles
                    buttons={[
                      { label: 'ใหม่', value: false },
                      { label: 'มือสอง', value: true }
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <ItemList
              originData={items}
              onSubmit={onUpdateItems}
              mainForm={form}
              noItemAdded={cState.noItemAdded}
              forceValidate={forceValidate}
            />
          </div>
        )}
        <div className="d-flex flex-column mt-4 align-items-end">
          <Form.Item
            name="warehouseCheckedBy"
            label="ตรวจรับสินค้าโดย"
            rules={getRules(['required'])}
            className="d-flex flex-row mr-4 pr-4"
          >
            <EmployeeSelector
              disabled={
                selects.length === 0 &&
                filteredData.filter(l => l.deleted).length === 0 &&
                inputType === 'importFromFile'
              }
              className="mx-4"
              style={{ minWidth: 200 }}
              dropdownAlign={{ offset: [-80, 4] }}
            />
          </Form.Item>
        </div>
      </Form>
      <div className="border-bottom bg-white p-3 text-right">
        {inputType === 'importFromFile' && (
          <Button
            onClick={() =>
              history.push('/utils/upload-data-from-excel-file', {
                params: { dataType: 'vehicles' }
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
            นำเข้ารายการรับรถและอุปกรณ์ จากระบบ SKC
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
