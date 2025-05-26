import React, { useState } from 'react';
import { Form, Input, Row, Col, InputNumber, Card, Descriptions, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { sortArr, showWarn } from '../../../utils/functions';
import PriceTypeSelector from 'components/PriceTypeSelector';
import { SearchOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import DocSelector from '../../../components/DocSelector';
import { InputPriceItem, InputPriceFormValues, RenderSummaryProps } from './types';
import { collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getRules } from '../../../utils/form';
import type { FormInstance } from 'antd/lib/form';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import './RenderSummary.css';

export const ExpandedRowRender: React.FC<{ record: InputPriceItem }> = ({ record }) => {
  const { t } = useTranslation('inputPrice');
  return (
    <div
      className="expanded-row-container"
      style={{ padding: 16, borderRadius: 8, margin: '8px 0' }}
    >
      <Card
        bordered={false}
        style={{ boxShadow: '0 2px 8px #f0f1f2', borderRadius: 8 }}
        bodyStyle={{ padding: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 500, color: '#555' }}>
              {t('receiptInfo', 'ข้อมูลใบรับสินค้า')}
            </div>
            <Descriptions column={1} size="small" bordered={false} layout="vertical">
              {record?.receiveNo && (
                <Descriptions.Item label={t('receiptNumber')}>{record.receiveNo}</Descriptions.Item>
              )}
              {record?.billNoSKC && (
                <Descriptions.Item label={t('receiptNumber')}>{record.billNoSKC}</Descriptions.Item>
              )}
              {record?.branch && (
                <Descriptions.Item label={t('branchReceived')}>{record.branch}</Descriptions.Item>
              )}
              <Descriptions.Item label={t('inputDate')}>
                {dayjs(record.inputDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8, fontWeight: 500, color: '#555' }}>
              {t('productInfo', 'ข้อมูลสินค้า')}
            </div>
            <Descriptions column={1} size="small" bordered={false} layout="vertical">
              {record?.productCode && (
                <Descriptions.Item label={t('productCode')}>{record.productCode}</Descriptions.Item>
              )}
              {record?.vehicleNo && (
                <Descriptions.Item label={t('vehicleNumber')}>
                  {Array.isArray(record.vehicleNo) ? record.vehicleNo.join(', ') : record.vehicleNo}
                </Descriptions.Item>
              )}
              {record?.peripheralNo && (
                <Descriptions.Item label={t('peripheralNumber')}>
                  {Array.isArray(record.peripheralNo)
                    ? record.peripheralNo.join(', ')
                    : record.peripheralNo}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export const initialValues: InputPriceFormValues = {
  billNoSKC: '',
  taxInvoiceNo: '',
  taxInvoiceDate: dayjs(),
  taxFiledPeriod: '',
  creditDays: 0,
  dueDate: dayjs(),
  priceType: '',
  remark: '',
  billDiscount: 0,
  deductDeposit: 0,
  transferCompleted: false,
  items: [],
};

interface RenderHeaderProps {
  form: FormInstance;
  onPriceTypeChange: (value: string) => void;
}

export const renderHeader = ({
  form,
  onPriceTypeChange,
}: RenderHeaderProps): React.ReactElement => (
  <div
    className="header-form-block"
    style={{ borderRadius: 8, padding: '24px 24px 0 24px', marginBottom: 0 }}
  >
    <Row gutter={24} align="middle" style={{ marginBottom: 0 }}>
      <Col span={10} style={{ minWidth: 320 }}>
        <Form.Item
          name="billNoSKC"
          label={
            <span>
              <SearchOutlined /> ค้นหาจาก เลขที่ใบรับสินค้า
            </span>
          }
        >
          <DocSelector
            collection="sections/stocks/importVehicles"
            orderBy={['billNoSKC']}
            wheres={[['warehouseChecked', '!=', null]]}
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
        <Form.Item
          name="taxInvoiceDate"
          label={<span style={{ fontWeight: 500 }}>* วันที่ใบกำกับภาษี</span>}
          rules={getRules(['required'])}
        >
          <DatePicker placeholder="วันที่ใบกำกับภาษี" />
        </Form.Item>
      </Col>
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item
          name="priceType"
          label={<span style={{ fontWeight: 500 }}>* ประเภทราคา</span>}
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
          <PriceTypeSelector onChange={onPriceTypeChange} />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={24} style={{ marginBottom: 0 }}>
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item
          name="taxFiledPeriod"
          label={<span style={{ fontWeight: 500 }}>* ยื่นภาษีในงวด</span>}
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
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
              },
            }),
          ]}
        >
          <InputNumber placeholder="เครดิต" addonAfter="วัน" style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col span={6} style={{ minWidth: 220 }}>
        <Form.Item
          name="dueDate"
          label={<span style={{ fontWeight: 500 }}>* วันครบกำหนด</span>}
          rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}
        >
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
      where('total', '==', null),
    );

    const cSnap = await getDocs(q);
    if (cSnap.empty) {
      showWarn('No document');
      return stockImportArr;
    }

    cSnap.forEach((doc) => {
      const sItem = { ...(doc.data() as InputPriceItem), _key: doc.id };
      stockImportArr.push(sItem);
    });

    return sortArr(stockImportArr as unknown as Record<string, unknown>[], 'importTime').map(
      (od, id) => ({
        ...od,
        id,
        key: id.toString(),
        productCode: (od as any).productCode || '',
        productName: (od as any).productName || '',
        vehicleNo: (od as any).vehicleNo || [],
        peripheralNo: (od as any).peripheralNo || [],
        engineNo: (od as any).engineNo || [],
        productType: (od as any).productType || null,
        detail: (od as any).detail || '',
        unitPrice: (od as any).unitPrice || 0,
        qty: (od as any).qty || 1,
        total: (od as any).total || 0,
        status: (od as any).status || 'pending',
        _key: (od as any)._key || id.toString(),
      }),
    ) as InputPriceItem[];
  } catch (e) {
    showWarn(e instanceof Error ? e.message : String(e));
    throw e;
  }
};

export const checkItemsUpdated = (fArr: InputPriceItem[]): boolean => {
  return fArr.every((l) => l.total !== null && l.unitPrice !== null);
};

export const RenderSummary: React.FC<
  RenderSummaryProps & { billDiscount?: number | null; deductDeposit?: number | null }
> = ({
  total,
  afterDiscount,
  afterDepositDeduct,
  billVAT,
  billTotal,
  onBillDiscountChange,
  onDeductDepositChange,
  billDiscount,
  deductDeposit,
}) => {
  const { t } = useTranslation('inputPrice');

  return (
    <Descriptions
      column={1}
      bordered
      size="small"
      contentStyle={{ textAlign: 'right', paddingRight: 12, whiteSpace: 'nowrap' }}
      labelStyle={{ fontWeight: 'normal', paddingLeft: 12, whiteSpace: 'nowrap' }}
      colon={false}
      className="summary-descriptions"
      layout="horizontal"
    >
      <Descriptions.Item label={t('total')}>
        <span className="summary-value">
          {total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t('unit')}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label={t('discount')}>
        <div className="summary-flex">
          <InputNumber
            value={isNaN(Number(billDiscount)) ? undefined : billDiscount}
            placeholder="0"
            onChange={onBillDiscountChange}
            className="summary-input"
            bordered={false}
            controls={false}
          />
          <span className="summary-unit">{t('unit')}</span>
          <span className="summary-value">
            {numeral(afterDiscount).format('0,0.00')} {t('unit')}
          </span>
        </div>
      </Descriptions.Item>
      <Descriptions.Item label={t('deposit')}>
        <div className="summary-flex">
          <InputNumber
            value={isNaN(Number(deductDeposit)) ? undefined : deductDeposit}
            placeholder="0"
            onChange={(value) => onDeductDepositChange(Number(value) || 0)}
            className="summary-input"
            bordered={false}
            controls={false}
          />
          <span className="summary-unit">{t('unit')}</span>
          <span className="summary-value">
            {numeral(afterDepositDeduct).format('0,0.00')} {t('unit')}
          </span>
        </div>
      </Descriptions.Item>
      <Descriptions.Item label={t('vat', 'ภาษีมูลค่าเพิ่ม 7%')}>
        <span className="summary-value">
          {billVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t('unit')}
        </span>
      </Descriptions.Item>
      <Descriptions.Item label={<span style={{ fontWeight: 600 }}>{t('grandTotal')}</span>}>
        <span className="summary-value summary-grand">
          {billTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t('unit')}
        </span>
      </Descriptions.Item>
    </Descriptions>
  );
};
