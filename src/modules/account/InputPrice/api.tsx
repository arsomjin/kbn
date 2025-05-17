import React, { useState } from 'react';
import { Form, Input, Row, Col, InputNumber } from 'antd';
import { DateTime } from 'luxon';
import { sortArr, showWarn } from '../../../utils/functions';
import PriceTypeSelector from '../../../components/PriceTypeSelector';
import { SearchOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import DocSelector from '../../../components/DocSelector';
import { ListItem, DatePicker } from '../../../elements';
import { InputPriceItem, InputPriceFormValues, RenderSummaryProps } from './types';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getRules } from '../../../utils/form';
import type { FormInstance } from 'antd/lib/form';

export const expandedRowRender = (record: InputPriceItem): React.ReactElement => (
  <div className="ml-4 bg-light bordered pb-1">
    <Row>
      <Col md={4}>
        {record?.receiveNo && <ListItem label="เลขที่ใบรับสินค้า" info={record.receiveNo} />}
        {record?.billNoSKC && <ListItem label="เลขที่ใบรับสินค้า" info={record.billNoSKC} />}
        {record?.branch && <ListItem label="สาขาที่รับสินค้า" info={record.branch} />}
        <ListItem label="วันที่คีย์" info={DateTime.fromFormat(record.inputDate || '', 'yyyy-MM-dd').toFormat('dd/MM/yyyy')} />
      </Col>
      <Col md={4}>
        {record?.productCode && <ListItem label="รหัสสินค้า" info={record.productCode} />}
        {record?.vehicleNo && <ListItem label="เลขรถ" info={record.vehicleNo.join(', ')} />}
        {record?.peripheralNo && <ListItem label="เลขอุปกรณ์ต่อพ่วง" info={Array.isArray(record.peripheralNo) ? record.peripheralNo.join(', ') : record.peripheralNo} />}
      </Col>
    </Row>
  </div>
);

export const initialValues: InputPriceFormValues = {
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

interface RenderHeaderProps {
  form: FormInstance;
  onPriceTypeChange: (value: string) => void;
}

export const renderHeader = ({ form, onPriceTypeChange }: RenderHeaderProps): React.ReactElement => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row>
      <Col md={4} className="form-group">
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
    <Row>
      <Col md={4}>
        <Form.Item
          name="taxInvoiceNo"
          label="เลขที่ใบกำกับภาษี"
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
          <Input placeholder="เลขที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
      <Col md={4}>
        <Form.Item name="taxInvoiceDate" label="วันที่ใบกำกับภาษี" rules={getRules(['required'])}>
          <DatePicker placeholder="วันที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
      <Col md={4}>
        <Form.Item name="priceType" label="ประเภทราคา" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <PriceTypeSelector onChange={onPriceTypeChange} />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md={4}>
        <Form.Item name="taxFiledPeriod" label="ยื่นภาษีในงวด" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <Input placeholder="ยื่นภาษีในงวด" />
        </Form.Item>
      </Col>
      <Col md={4}>
        <Form.Item
          name="creditDays"
          label="เครดิต"
          rules={[
            { required: true, message: 'กรุณาป้อนข้อมูล' },
            ({ getFieldValue }) => ({
              validator(_rule: unknown, value: unknown) {
                if (!value || !isNaN(Number(value))) {
                  return Promise.resolve();
                }
                return Promise.reject('กรุณาป้อนจำนวนวันเป็นตัวเลข');
              }
            })
          ]}
        >
          <InputNumber placeholder="เครดิต" addonAfter="วัน" style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col md={4}>
        <Form.Item name="dueDate" label="วันครบกำหนด" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
          <DatePicker placeholder="วันครบกำหนด" />
        </Form.Item>
      </Col>
    </Row>
  </div>
);

export const getWarehouseCheckedData = async (firestore: Firestore): Promise<InputPriceItem[]> => {
  try {
    const stockImportArr: InputPriceItem[] = [];
    const stockImportRef = collection(firestore, 'sections', 'stocks', 'importVehicles');
    const q = query(
      stockImportRef,
      where('warehouseChecked', '!=', null),
      where('total', '==', null)
    );
    
    const cSnap = await getDocs(q);
    if (cSnap.empty) {
      showWarn('No document');
      return stockImportArr;
    }

    cSnap.forEach(doc => {
      const sItem = { ...doc.data() as InputPriceItem, _key: doc.id };
      stockImportArr.push(sItem);
    });

    return sortArr(stockImportArr, 'importTime').map((od, id) => ({
      ...od,
      id,
      key: id.toString()
    }));
  } catch (e) {
    showWarn(e instanceof Error ? e.message : String(e));
    throw e;
  }
};

export const checkItemsUpdated = (fArr: InputPriceItem[]): boolean => {
  return fArr.every(l => l.total !== null && l.unitPrice !== null);
};

export const RenderSummary: React.FC<RenderSummaryProps> = ({
  total,
  afterDiscount,
  afterDepositDeduct,
  billVAT,
  billTotal,
  onBillDiscountChange,
  onDeductDepositChange
}) => {
  const [bdError, setBdError] = useState(false);
  const [ddError, setDdError] = useState(false);

  return (
    <div className="d-flex flex-column align-items-end">
      <div className="my-4" style={{ width: 450 }}>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Form.Item label="จำนวนเงิน" style={{ marginBottom: 0 }}>
              <InputNumber
                value={total}
                style={{ width: '100%' }}
                disabled
                className="text-right text-secondary"
                formatter={value => numeral(value).format('0,0.00')}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="หักส่วนลด" style={{ marginBottom: 0 }}>
              <InputNumber
                onChange={value => onBillDiscountChange(typeof value === 'number' ? value : null)}
                className="text-right"
                style={{ width: '100%' }}
                formatter={value => `${value} บาท`}
                parser={value => value!.replace(/[^\d.-]/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="หักเงินมัดจำ" style={{ marginBottom: 0 }}>
              <InputNumber
                onChange={value => onDeductDepositChange(typeof value === 'number' ? value : null)}
                className="text-right"
                style={{ width: '100%' }}
                formatter={value => `${value} บาท`}
                parser={value => value!.replace(/[^\d.-]/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="ภาษีมูลค่าเพิ่ม" style={{ marginBottom: 0 }}>
              <InputNumber
                value={billVAT}
                style={{ width: '100%' }}
                disabled
                className="text-right text-secondary"
                formatter={value => numeral(value).format('0,0.00')}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="ยอดรวมทั้งสิ้น" style={{ marginBottom: 0 }}>
              <InputNumber
                value={billTotal}
                style={{ width: '100%' }}
                disabled
                className="text-right text-secondary"
                formatter={value => numeral(value).format('0,0.00')}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
}; 