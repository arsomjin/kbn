import React from 'react';
import { Tooltip, Tag, Form, Input } from 'antd';
import { Row, Col } from 'shards-react';
import numeral from 'numeral';
import moment from 'moment';
import { SearchSelect } from 'elements';
import { DatePicker } from 'elements';
import { sortArr } from 'functions';
import { showWarn } from 'functions';

export const columns = [
  {
    title: 'ลำดับ',
    dataIndex: 'id',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'รหัส',
    dataIndex: 'productCode'
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    ellipsis: true,
    render: text => (
      <Tooltip placement="topLeft" title={text}>
        {text}
      </Tooltip>
    )
  },
  {
    title: 'คลัง',
    dataIndex: 'storeLocationCode'
  },
  {
    title: 'จำนวน',
    dataIndex: 'import',
    render: text => <div className="text-right">{numeral(text).format('0,0')}</div>
  },
  {
    title: 'หน่วย',
    dataIndex: 'unit',
    ellipsis: true
  },
  {
    title: 'ราคาต่อหน่วย',
    dataIndex: 'unitPrice',
    render: text => <div className="text-right">{text ? numeral(text).format('0,0.00') : '-'}</div>,
    editable: true,
    required: true,
    number: true
  },
  {
    title: 'ส่วนลด',
    dataIndex: 'discount',
    render: text => <div className="text-right">{text ? numeral(text).format('0,0.00') : '-'}</div>,
    editable: true,
    number: true
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total',
    render: text => <div className="text-right">{text ? numeral(text).format('0,0.00') : '-'}</div>
  }
];

export const expandedRowRender = record => (
  <div className="ml-4 bg-light bordered pb-1">
    {record?.receiveNo && <Tag>{`เลขที่ใบรับสินค้า: ${record.receiveNo}`}</Tag>}
    {record?.billNoSKC && <Tag>{`เลขที่ใบรับสินค้า: ${record.billNoSKC}`}</Tag>}
    {record?.branch && <Tag>{`สาขาที่รับสินค้า: ${record.branch}`}</Tag>}
    {record?.inputDate && <Tag>{`วันที่คีย์: ${moment(record.inputDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`}</Tag>}
    {record?.vehicleId && <Tag>{`หมายเลขรถ: ${record.vehicleId}`}</Tag>}
    {record?.vehicleId && <Tag>{`เลขอุปกรณ์ต่อพ่วง: ${record.peripheralNo}`}</Tag>}
  </div>
);

const initialValues = {
  taxInvoiceNo: null,
  taxInvoiceDate: undefined,
  taxFiledPeriod: null,
  creditDays: null,
  dueDate: undefined,
  warehouseReceiveDate: undefined,
  priceType: null,
  remark: null
};

export const renderHeader = ({ form, onBillSelect, cState, billOptions }) => (
  <Form
    form={form}
    layout="vertical"
    // onFinish={onFinish}
    initialValues={initialValues}
    style={{ alignItems: 'center' }}
  >
    <div className="border-bottom bg-white p-3">
      <Row form>
        <Col md="4" className="form-group">
          <label>เลขที่ใบรับสินค้า</label>
          <SearchSelect
            id={'receiveNo'}
            type={'text'}
            placeholder="เลขที่ใบรับสินค้า"
            onChange={onBillSelect}
            options={billOptions}
            // onInputChange={(txt) => showLog('txt', txt)}
            value={cState.mReceiveNo}
          />
        </Col>
        <Col md="4">
          <Form.Item name="taxInvoiceNo" label="เลขที่ใบกำกับภาษี">
            <Input placeholder="เลขที่ใบกำกับภาษี" />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="taxInvoiceDate" label="วันที่ใบกำกับภาษี">
            <Input placeholder="วันที่ใบกำกับภาษี" />
          </Form.Item>
        </Col>
      </Row>
      <Row form>
        <Col md="4">
          <Form.Item name="taxFiledPeriod" label="ยื่นภาษีในงวด">
            <Input placeholder="ยื่นภาษีในงวด" />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="creditDays" label="เครดิต">
            <Input placeholder="เครดิต" addonAfter="วัน" />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="dueDate" label="วันครบกำหนด">
            <DatePicker placeholder="วันครบกำหนด" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  </Form>
);

export const getWarehouseCheckedData = firestore =>
  new Promise(async (r, j) => {
    try {
      let stockImportArr = [];
      const stockImportRef = firestore.collection('stockImportVehicles').where('warehouseChecked', '!=', null);
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
        id: id + 1
      }));
      let mArr = JSON.parse(JSON.stringify(stockImportArr));
      // showLog('mArr', mArr);
      mArr = sortArr(mArr, 'time');
      mArr = mArr.map((od, id) => ({
        ...od,
        id: id + 1
      }));
      r(mArr);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });
