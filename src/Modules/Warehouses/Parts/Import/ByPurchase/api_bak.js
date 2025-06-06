import React from 'react';
import { Form, Input, Select, Divider } from 'antd';
import { Row, Col } from 'shards-react';
import moment from 'moment';
import { SearchSelect } from 'elements';
import { DatePicker } from 'elements';
import { sortArr } from 'functions';
import { showWarn } from 'functions';
import { Seller } from 'data/Constant';
import { SearchOutlined } from '@ant-design/icons';
import InputMethodSelector from 'components/InputMethodSelector';
import { ListItem } from 'elements';
const { Option } = Select;

export const columns = [
  {
    title: 'ลำดับ',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'docNo',
    align: 'center',
    width: 120
  },
  {
    title: 'รหัส',
    dataIndex: 'pCode'
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName'
  },
  {
    title: 'จำนวน',
    dataIndex: 'import',
    width: 100
  },
  {
    title: 'หน่วย',
    dataIndex: 'unit'
  },
  {
    title: 'สาขา',
    dataIndex: 'branch'
  },
  {
    title: 'วันที่คีย์',
    dataIndex: 'inputDate'
  }
];

export const expandedRowRender = record => {
  // showLog({ record });
  return (
    <div className="bg-light bordered pb-1">
      <div className="border py-2">
        {/* <label className="text-primary ml-4">ข้อมูลเพิ่มเติม</label> */}
        <div className="d-flex flex-row">
          <div>
            <ListItem label="เลขที่ใบจ่ายสินค้า SKC" info={record.billNoSKC} />
            <ListItem
              label="วันที่ใบจ่ายสินค้า"
              info={record.docDate ? moment(record.docDate, 'YYYY-MM-DD').format('D/MM/YYYY') : record.docDate}
            />
            <ListItem label="เลขที่ใบสั่งซื้อ" info={record.purchaseNo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const initialValues = {
  seller: 'siamKubota',
  department: 'รถและอุปกรณ์',
  receiveNo: null,
  purchaseNo: null,
  invoiceDate: undefined,
  warehouseReceiveDate: undefined,
  remark: null
};

export const initialItemValues = {
  dealer: null,
  productId: null,
  pCode: null,
  productName: null,
  partLocationCode: null,
  peripheralNo: null,
  import: null,
  unit: null,
  branch: null,
  branchCode: null,
  inputDate: moment().format('YYYY-MM-DD'),
  warehouseCheckedBy: null
};

export const renderHeader = ({
  onSellerSelect,
  onBillSelect,
  onPOSelect,
  seller,
  billOptions,
  PO_Options,
  cState,
  inputType,
  onInputTypeChange
}) => {
  const isInputFromFile = inputType === 'importFromFile';
  return (
    <div className="border-bottom bg-white px-3 pt-3">
      <Row form>
        <Col md="3">
          <Form.Item name="seller" label="ผู้จำหน่าย">
            <Select placeholder="ผู้จำหน่าย" onChange={onSellerSelect}>
              {Object.keys(Seller).map(sl => (
                <Option key={sl} value={sl}>
                  {Seller[sl]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        {seller !== 'store' && (
          <Col md="3">
            <Form.Item label="วิธีบันทึกรายการ">
              <InputMethodSelector value={inputType} onChange={onInputTypeChange} />
            </Form.Item>
          </Col>
        )}
      </Row>
      <div className="bg-light px-3 pb-3 border-bottom mb-3">
        <Divider>ค้นหา</Divider>
        <Row form>
          {isInputFromFile ? (
            <>
              <Col md="3" style={{ marginTop: -6, marginBottom: 8 }}>
                <label>
                  <SearchOutlined /> ค้นหาจาก เลขที่ใบจ่ายสินค้า
                </label>
                <SearchSelect
                  id={'billNoSKC'}
                  type={'text'}
                  placeholder="เลขที่ใบจ่ายสินค้า SKC"
                  onChange={onBillSelect}
                  options={billOptions}
                  // onInputChange={(txt) => showLog('txt', txt)}
                  value={cState.mBillSKC}
                  size="small"
                />
              </Col>
              <Col md="3" style={{ marginTop: -6, marginBottom: 8 }}>
                <label>
                  <SearchOutlined /> ค้นหาจาก ใบสั่งซื้อ
                </label>
                <SearchSelect
                  id={'purchaseNo'}
                  type={'text'}
                  placeholder="เลขที่ใบสั่งซื้อ"
                  onChange={onPOSelect}
                  options={PO_Options}
                  // onInputChange={(txt) => showLog('txt', txt)}
                  value={cState.mPurchaseDoc}
                  size="small"
                />
              </Col>
            </>
          ) : (
            <>
              <Col md="3">
                <Form.Item
                  name="receiveNo"
                  label="เลขที่ใบรับสินค้า"
                  rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
                >
                  <Input placeholder="เลขที่ใบรับสินค้า" />
                </Form.Item>
              </Col>
              <Col md="3">
                <Form.Item name="purchaseNo" label="เลขที่ใบสั่งซื้อ">
                  <Input placeholder="เลขที่ใบสั่งซื้อ" />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </div>
      <Row form>
        <Col md="3">
          <Form.Item
            name="invoiceDate"
            label="วันที่ตามใบจ่ายสินค้า"
            rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
          >
            <DatePicker placeholder="วันที่ตามใบจ่ายสินค้า" />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item
            name="warehouseReceiveDate"
            label="วันที่รับสินค้า"
            rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
          >
            <DatePicker placeholder="วันที่รับสินค้า" />
          </Form.Item>
        </Col>
      </Row>
      {/* <Row form>
          <Col md="3">
            <Form.Item
              name="remark"
              label="หมายเหตุ"
              // style={{ display: 'flex', minWidth: 240 }}
            >
              <Input placeholder="หมายเหตุ" />
            </Form.Item>
          </Col>
        </Row> */}
    </div>
  );
};

export const getWarehouseCheckedData = firestore =>
  new Promise(async (r, j) => {
    try {
      let stockImportArr = [];
      const stockImportRef = firestore
        .collection('sections')
        .doc('stocks')
        .collection('importParts')
        .where('warehouseChecked', '==', null);
      let cSnap = await stockImportRef.get();
      if (cSnap.empty) {
        showWarn('No document');
        r(stockImportArr);
        return;
      }
      cSnap.forEach(doc => {
        // showLog('item', doc.data());
        let sItem = doc.data();
        sItem._key = doc.id;
        sItem.key = doc.id;
        stockImportArr.push(sItem);
      });
      stockImportArr = stockImportArr.map((item, id) => ({
        ...item,
        id
      }));
      let mArr = JSON.parse(JSON.stringify(stockImportArr));
      // showLog('mArr', mArr);
      mArr = sortArr(mArr, 'time');
      mArr = mArr.map((od, id) => ({
        ...od,
        id
      }));
      r(mArr);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });
