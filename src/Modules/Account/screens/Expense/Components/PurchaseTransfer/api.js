import React, { useState } from 'react';
import { Tag, Form, Input } from 'antd';
import { Row, Col } from 'shards-react';
import moment from 'moment';
import { SearchSelect } from 'elements';
import { DatePicker } from 'elements';
import { sortArr } from 'functions';
import { showWarn } from 'functions';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { SearchOutlined } from '@ant-design/icons';
import { InputGroup, InputGroupAddon, InputGroupText } from 'shards-react';
import numeral from 'numeral';

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
    ellipsis: true
  },
  {
    title: 'คลัง',
    dataIndex: 'storeLocationCode'
  },
  {
    title: 'จำนวน',
    dataIndex: 'import'
  },
  {
    title: 'หน่วย',
    dataIndex: 'unit'
  },
  {
    title: 'ราคาต่อหน่วย',
    dataIndex: 'unitPrice',
    editable: true,
    required: true,
    number: true
  },
  {
    title: 'ส่วนลด',
    dataIndex: 'discount',
    editable: true,
    number: true
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total'
  }
];

export const expandedRowRender = record => (
  <div className="ml-4 bg-light bordered pb-1">
    {record?.receiveNo && <Tag>{`เลขที่ใบรับสินค้า: ${record.receiveNo}`}</Tag>}
    {record?.billNoSKC && <Tag>{`เลขที่ใบรับสินค้า: ${record.billNoSKC}`}</Tag>}
    {record?.branch && <Tag>{`สาขาที่รับสินค้า: ${record.branch}`}</Tag>}
    {record?.inputDate && <Tag>{`วันที่คีย์: ${moment(record.inputDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`}</Tag>}
    {record?.productCode && <Tag>{`หมายเลขรถ: ${record.productCode}`}</Tag>}
    {record?.vehicleNo && <Tag>{`หมายเลขรถ: ${record.vehicleNo}`}</Tag>}
    {record?.peripheralNo && <Tag>{`เลขอุปกรณ์ต่อพ่วง: ${record.peripheralNo}`}</Tag>}
  </div>
);

export const initialValues = {
  taxInvoiceNo: null,
  taxInvoiceDate: undefined,
  taxFiledPeriod: null,
  creditDays: null,
  dueDate: undefined,
  priceType: null,
  remark: null,
  billDiscount: null,
  deductDeposit: null,
  transferCompleted: false
};

export const renderHeader = ({ form, onBillSelect, cState, billOptions, onPriceTypeChange }) => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row form>
      <Col md="3" className="form-group">
        <label>
          <SearchOutlined className="text-primary" /> ค้นหาจาก เลขที่ใบรับสินค้า
        </label>
        <SearchSelect
          id={'receiveNo'}
          type={'text'}
          placeholder="เลขที่ใบรับสินค้า"
          onChange={onBillSelect}
          options={billOptions}
          // onInputChange={(txt) => showLog('txt', txt)}
          value={cState.mReceiveNo}
          size="small"
        />
      </Col>
      <Col md="3">
        <Form.Item
          name="taxInvoiceNo"
          label="เลขที่ใบกำกับภาษี"
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
          <Input placeholder="เลขที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
      <Col md="3">
        <Form.Item
          name="taxInvoiceDate"
          label="วันที่ใบกำกับภาษี"
          rules={[
            { required: true, message: 'กรุณาป้อนข้อมูล' },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                let creditDays = getFieldValue('creditDays');
                //  showLog({ value, creditDays });
                !!creditDays &&
                  !isNaN(creditDays) &&
                  form.setFieldsValue({
                    dueDate: moment(value).add(creditDays, 'days')
                  });
                return Promise.resolve();
              }
            })
          ]}
        >
          <DatePicker placeholder="วันที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
    </Row>
    <Row form>
      <Col md="3">
        <Form.Item name="priceType" label="ประเภทราคา" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <PriceTypeSelector onChange={onPriceTypeChange} />
        </Form.Item>
      </Col>
      <Col md="3">
        <Form.Item name="taxFiledPeriod" label="ยื่นภาษีในงวด" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <Input placeholder="ยื่นภาษีในงวด" />
        </Form.Item>
      </Col>
      <Col md="3">
        <Form.Item
          name="creditDays"
          label="เครดิต"
          rules={[
            { required: true, message: 'กรุณาป้อนข้อมูล' },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || !isNaN(value)) {
                  let taxInvoiceDate = getFieldValue('taxInvoiceDate');
                  //  showLog({ value, taxInvoiceDate });
                  !isNaN(value) &&
                    !!taxInvoiceDate &&
                    form.setFieldsValue({
                      dueDate: moment(taxInvoiceDate).add(value, 'days')
                    });
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
      <Col md="3">
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
