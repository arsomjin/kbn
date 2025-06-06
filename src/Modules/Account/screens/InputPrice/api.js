import React, { useState } from 'react';
import { Form, Input } from 'antd';
import { Row, Col } from 'shards-react';
import moment from 'moment';
import { DatePicker } from 'elements';
import { sortArr } from 'functions';
import { showWarn } from 'functions';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { SearchOutlined } from '@ant-design/icons';
import { InputGroup, InputGroupAddon, InputGroupText } from 'shards-react';
import numeral from 'numeral';
import DocSelector from 'components/DocSelector';
import { ListItem } from 'elements';
import { getRules } from 'api/Table';

export const expandedRowRender = record => (
  <div className="ml-4 bg-light bordered pb-1">
    <Row>
      <Col md="4">
        {record?.receiveNo && <ListItem label="เลขที่ใบรับสินค้า" info={record.receiveNo} />}
        {record?.billNoSKC && <ListItem label="เลขที่ใบรับสินค้า" info={record.billNoSKC} />}
        {record?.branch && <ListItem label="สาขาที่รับสินค้า" info={record.branch} />}
        <ListItem label="วันที่คีย์" info={moment(record.inputDate, 'YYYY-MM-DD').format('DD/MM/YYYY')} />
      </Col>
      <Col md="4">
        {record?.productCode && <ListItem label="รหัสสินค้า" info={record.productCode} />}
        {record?.vehicleNo && <ListItem label="เลขรถ" info={record.vehicleNo} />}
        {record?.peripheralNo && <ListItem label="เลขอุปกรณ์ต่อพ่วง" info={record.peripheralNo} />}
      </Col>
    </Row>
  </div>
);

export const initialValues = {
  billNoSKC: null,
  taxInvoiceNo: null,
  taxInvoiceDate: undefined,
  taxFiledPeriod: null,
  creditDays: null,
  dueDate: undefined,
  priceType: null,
  remark: null,
  billDiscount: null,
  deductDeposit: null,
  transferCompleted: false,
  items: []
};

export const renderHeader = ({ form, onPriceTypeChange }) => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row form>
      <Col md="4" className="form-group">
        <Form.Item
          name="billNoSKC"
          label={
            <label>
              <SearchOutlined className="text-primary" /> ค้นหาจาก เลขที่ใบรับสินค้า
            </label>
          }
        >
          <DocSelector
            collection="sections/stocks/importVehicles"
            orderBy={['billNoSKC']}
            wheres={[
              ['warehouseChecked', '!=', null],
              ['total', '==', null]
            ]}
            size="small"
            dropdownStyle={{ minWidth: 420 }}
            hasKeywords
            placeholder="เลขที่ใบรับสินค้า"
          />
        </Form.Item>
      </Col>
    </Row>
    <Row form>
      <Col md="4">
        <Form.Item
          name="taxInvoiceNo"
          label="เลขที่ใบกำกับภาษี"
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
          <Input placeholder="เลขที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="taxInvoiceDate" label="วันที่ใบกำกับภาษี" rules={getRules(['required'])}>
          <DatePicker placeholder="วันที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="priceType" label="ประเภทราคา" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <PriceTypeSelector onChange={onPriceTypeChange} />
        </Form.Item>
      </Col>
    </Row>
    <Row form>
      <Col md="4">
        <Form.Item name="taxFiledPeriod" label="ยื่นภาษีในงวด" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <Input placeholder="ยื่นภาษีในงวด" />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item
          name="creditDays"
          label="เครดิต"
          rules={[
            { required: true, message: 'กรุณาป้อนข้อมูล' },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || !isNaN(value)) {
                  return Promise.resolve();
                }
                return Promise.reject('กรุณาป้อนจำนวนวันเป็นตัวเลข');
              }
            })
          ]}
        >
          <Input placeholder="เครดิต" addonAfter="วัน" />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="dueDate" label="วันครบกำหนด" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <DatePicker placeholder="วันครบกำหนด" />
        </Form.Item>
      </Col>
    </Row>
  </div>
);

export const getWarehouseCheckedData = firestore =>
  new Promise(async (r, j) => {
    try {
      let stockImportArr = [];
      const stockImportRef = firestore
        .collection('sections')
        .doc('stocks')
        .collection('importVehicles')
        .where('warehouseChecked', '!=', null)
        .where('total', '==', null);
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
        stockImportArr.push(sItem);
      });
      stockImportArr = stockImportArr.map((item, id) => ({
        ...item,
        id,
        key: id
      }));
      let mArr = JSON.parse(JSON.stringify(stockImportArr));
      // showLog('mArr', mArr);
      mArr = sortArr(mArr, 'importTime');
      mArr = mArr.map((od, id) => ({
        ...od,
        id,
        key: id
      }));
      r(mArr);
    } catch (e) {
      showWarn(e);
      j(e);
    }
  });

export const checkItemsUpdated = fArr => {
  let allItemsUpdated = true;
  fArr.map(l => {
    if (l.total === null || l.unitPrice === null) {
      allItemsUpdated = false;
    }
    return l;
  });
  return allItemsUpdated;
};

export const RenderSummary = ({
  total,
  afterDiscount,
  afterDepositDeduct,
  billVAT,
  billTotal,
  onBillDiscountChange,
  onDeductDepositChange
}) => {
  // showLog({ total, afterDiscount, afterDepositDeduct, billVAT, billTotal });
  const [bdError, setBdError] = useState(false);
  const [ddError, setDdError] = useState(false);

  return (
    <div className="d-flex flex-column align-items-end">
      <div className="my-4" style={{ width: 450 }}>
        <InputGroup>
          <InputGroupAddon type="prepend">
            <InputGroupText style={{ width: 260 }}>จำนวนเงิน</InputGroupText>
          </InputGroupAddon>
          <Input
            value={numeral(total).format('0,0.00')}
            style={{ width: 140 }}
            disabled
            className="text-right text-secondary"
          />
          <InputGroupAddon type="append">
            <InputGroupText>บาท</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon type="prepend">
            <InputGroupText style={{ width: 120 }}>หักส่วนลด</InputGroupText>
            <Form.Item
              name="billDiscount"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || !isNaN(value)) {
                      setBdError(false);
                      return Promise.resolve();
                    }
                    // subForm.setFieldsValue({ total: null });
                    setBdError(true);
                    return Promise.reject('กรุณาป้อนส่วนลดเป็นตัวเลข');
                  }
                })
              ]}
              noStyle={!bdError}
            >
              <Input onChange={onBillDiscountChange} className="text-right" suffix="บาท" style={{ width: 140 }} />
            </Form.Item>
          </InputGroupAddon>
          <Input
            value={numeral(afterDiscount).format('0,0.00')}
            style={{ width: 140 }}
            disabled
            className="text-right text-secondary"
          />
          <InputGroupAddon type="append">
            <InputGroupText>บาท</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon type="prepend">
            <InputGroupText style={{ width: 120 }}>หักเงินมัดจำ</InputGroupText>
            <Form.Item
              name="deductDeposit"
              rules={[
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || !isNaN(value)) {
                      setDdError(false);
                      return Promise.resolve();
                    }
                    // subForm.setFieldsValue({ total: null });
                    setDdError(true);
                    return Promise.reject('กรุณาป้อนจำนวนเงินเป็นตัวเลข');
                  }
                })
              ]}
              noStyle={!ddError}
            >
              <Input onChange={onDeductDepositChange} className="text-right" suffix="บาท" style={{ width: 140 }} />
            </Form.Item>
          </InputGroupAddon>
          <Input
            value={numeral(afterDepositDeduct).format('0,0.00')}
            style={{ width: 140 }}
            disabled
            className="text-right text-secondary"
          />
          <InputGroupAddon type="append">
            <InputGroupText>บาท</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon type="prepend">
            <InputGroupText style={{ width: 260 }}>ภาษีมูลค่าเพิ่ม 7%</InputGroupText>
          </InputGroupAddon>
          <Input
            value={numeral(billVAT).format('0,0.00')}
            style={{ width: 140 }}
            disabled
            className="text-right text-secondary"
          />
          <InputGroupAddon type="append">
            <InputGroupText>บาท</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon type="prepend">
            <InputGroupText style={{ width: 260 }} className="text-primary">
              จำนวนเงินรวมทั้งสิ้น
            </InputGroupText>
          </InputGroupAddon>
          <Input
            value={numeral(billTotal).format('0,0.00')}
            style={{ width: 140 }}
            disabled
            className="text-right text-primary"
          />
          <InputGroupAddon type="append">
            <InputGroupText className="text-primary">บาท</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};
