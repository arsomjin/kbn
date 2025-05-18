import React, { useState } from 'react';
import { Form, Input, Row, Col, InputNumber, Card, Descriptions } from 'antd';
import { DateTime } from 'luxon';
import { sortArr, showWarn } from '../../../utils/functions';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { SearchOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import DocSelector from '../../../components/DocSelector';
import { ListItem, DatePicker } from '../../../elements';
import { InputPriceItem, InputPriceFormValues, RenderSummaryProps } from './types';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getRules } from '../../../utils/form';
import type { FormInstance } from 'antd/lib/form';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

export const ExpandedRowRender = (record: InputPriceItem): React.ReactElement => {
  const { t } = useTranslation('inputPrice');
  return (
  <div className="ml-4 bg-light bordered pb-1">
    <Row>
      <Col md={4}>
        {record?.receiveNo && <ListItem label={t('receiptNumber')} info={record.receiveNo} />}
        {record?.billNoSKC && <ListItem label={t('receiptNumber')} info={record.billNoSKC} />}
        {record?.branch && <ListItem label={t('branchReceived')} info={record.branch} />}
        <ListItem label={t('inputDate')} info={DateTime.fromFormat(record.inputDate || '', 'yyyy-MM-dd').toFormat('dd/MM/yyyy')} />
      </Col>
      <Col md={4}>
        {record?.productCode && <ListItem label={t('productCode')} info={record.productCode} />}
        {record?.vehicleNo && <ListItem label={t('vehicleNumber')} info={record.vehicleNo.join(', ')} />}
        {record?.peripheralNo && <ListItem label={t('peripheralNumber')} info={Array.isArray(record.peripheralNo) ? record.peripheralNo.join(', ') : record.peripheralNo} />}
      </Col>
    </Row>
  </div>
  );
};

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
  <div className="header-form-block" style={{ borderRadius: 8, padding: '24px 24px 0 24px', marginBottom: 0 }}>
    <Row gutter={24} align="middle" style={{ marginBottom: 0 }}>
      <Col span={10} style={{ minWidth: 320 }}>
        <Form.Item
          name="billNoSKC"
          label={<span><SearchOutlined /> ค้นหาจาก เลขที่ใบรับสินค้า</span>}
        >
          <DocSelector
            collection="sections/stocks/importVehicles"
            orderBy={['billNoSKC']}
            wheres={[["warehouseChecked", "!=", null], ["total", "==", null]]}
            size="small"
            dropdownStyle={{ minWidth: isMobile ? 420 : 600 }}
            hasKeywords
            placeholder="เลขที่ใบรับสินค้า"
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={24} style={{ marginBottom: 0 }}>
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item
          name="taxInvoiceNo"
          label={<span style={{ fontWeight: 500 }}>* เลขที่ใบกำกับภาษี</span>}
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
          <Input placeholder="เลขที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item name="taxInvoiceDate" label={<span style={{ fontWeight: 500 }}>* วันที่ใบกำกับภาษี</span>} rules={getRules(['required'])}>
          <DatePicker placeholder="วันที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item name="priceType" label={<span style={{ fontWeight: 500 }}>* ประเภทราคา</span>} rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}> 
          <PriceTypeSelector onChange={onPriceTypeChange} />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={24} style={{ marginBottom: 0 }}>
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item name="taxFiledPeriod" label={<span style={{ fontWeight: 500 }}>* ยื่นภาษีในงวด</span>} rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}> 
          <Input placeholder="ยื่นภาษีในงวด" />
        </Form.Item>
      </Col>
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item
          name="creditDays"
          label={<span style={{ fontWeight: 500 }}>* เครดิต</span>}
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
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item name="dueDate" label={<span style={{ fontWeight: 500 }}>* วันครบกำหนด</span>} rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}> 
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
  const { t } = useTranslation('inputPrice');
  
  return (
      <Descriptions 
        column={1} 
        bordered
        size="small"
        contentStyle={{ textAlign: 'right', paddingRight: 12 }}
        labelStyle={{ fontWeight: 'normal', paddingLeft: 12 }}
        colon={false}
        className="summary-descriptions"
      >
        <Descriptions.Item label={t('total')}>
          <span style={{ fontWeight: 500, marginRight: 8 }}>
            {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span>{t('unit')}</span>
        </Descriptions.Item>
        
        <Descriptions.Item label={t('discount')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <InputNumber
              value={isNaN(Number(total - afterDiscount)) ? undefined : (total - afterDiscount)}
              placeholder="0"
              onChange={onBillDiscountChange}
              style={{ 
                width: 80, 
                textAlign: 'right', 
                fontWeight: 600,
                border: 'none',
                background: 'transparent'
              }}
              bordered={false}
              controls={false}
            />
            <span style={{ marginLeft: 8, fontWeight: 600 }}>{t('unit')}</span>
            <span style={{ minWidth: 80, marginLeft: 16, fontWeight: 500 }}>
              {(afterDiscount - total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span style={{ marginLeft: 4 }}>{t('unit')}</span>
          </div>
        </Descriptions.Item>
        
        <Descriptions.Item label={t('deposit')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <InputNumber
              value={isNaN(Number(afterDepositDeduct - afterDiscount)) ? undefined : Math.abs(afterDepositDeduct - afterDiscount)}
              placeholder="0"
              onChange={value => onDeductDepositChange(Number(value) || 0)}
              style={{ 
                width: 80, 
                textAlign: 'right', 
                fontWeight: 600,
                border: 'none',
                background: 'transparent' 
              }}
              bordered={false}
              controls={false}
            />
            <span style={{ marginLeft: 8, fontWeight: 600 }}>{t('unit')}</span>
            <span style={{ minWidth: 80, marginLeft: 16, fontWeight: 500 }}>
              {(afterDepositDeduct - afterDiscount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span style={{ marginLeft: 4 }}>{t('unit')}</span>
          </div>
        </Descriptions.Item>
        
        <Descriptions.Item label={t('vat', 'ภาษีมูลค่าเพิ่ม 7%')}>
          <span style={{ fontWeight: 500, marginRight: 8 }}>
            {billVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span>{t('unit')}</span>
        </Descriptions.Item>
        
        <Descriptions.Item 
          label={<span style={{ fontWeight: 600 }}>{t('grandTotal')}</span>}
        >
          <span style={{ fontWeight: 700, marginRight: 8 }}>
            {billTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span style={{ fontWeight: 600 }}>{t('unit')}</span>
        </Descriptions.Item>
      </Descriptions>
  );
}; 