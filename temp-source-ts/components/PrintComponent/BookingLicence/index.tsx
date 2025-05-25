import React from 'react';
import { Row, Col, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { BookingLicenceProps, BookingLicenceItem } from './types';
import { VAT_RATE, CURRENCY, COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_EMAIL } from './api';
import PrintHeader from '../Common/PrintHeader';
import PrintContainer from '../Common/PrintContainer';
import PrintSignBox from '../Common/PrintSignBox';
import PrintFooter from '../Common/PrintFooter';
import BeforePrint from '../Common/BeforePrint';

const BookingLicence: React.FC<BookingLicenceProps> = ({ data, className, onBeforePrint }) => {
  const { t } = useTranslation('common');

  const tableColumns = [
    {
      title: t('print.items'),
      dataIndex: 'name',
      key: 'name',
      width: '40%'
    },
    {
      title: t('print.description'),
      dataIndex: 'description',
      key: 'description',
      width: '30%'
    },
    {
      title: t('print.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '10%'
    },
    {
      title: t('print.price'),
      dataIndex: 'price',
      key: 'price',
      width: '10%',
      render: (price: number) => `${price.toLocaleString()} ${CURRENCY}`
    },
    {
      title: t('print.lineTotal'),
      key: 'total',
      width: '10%',
      render: (_: unknown, record: BookingLicenceItem) =>
        `${(record.price * record.quantity).toLocaleString()} ${CURRENCY}`
    }
  ];

  return (
    <BeforePrint onBeforePrint={onBeforePrint}>
      <PrintContainer className={className}>
        <PrintHeader title={COMPANY_NAME} subtitle='Kubota Benjaphon Nakhonratchasima Co., Ltd.' />

        <Row gutter={24} style={{ marginTop: 32 }}>
          <Col span={8}>
            <h3>{t('print.bookingDetails')}</h3>
            <div>{COMPANY_ADDRESS}</div>
            <div>{COMPANY_PHONE}</div>
            <div>{COMPANY_EMAIL}</div>
          </Col>
          <Col span={8} offset={8}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <th className='text-right'>{t('print.bookingNo')}:</th>
                  <td className='text-right'>{data.bookingNo}</td>
                </tr>
                <tr>
                  <th className='text-right'>{t('print.bookingDate')}:</th>
                  <td className='text-right'>{data.bookingDate}</td>
                </tr>
              </tbody>
            </table>
          </Col>
        </Row>

        <Row style={{ marginTop: 48 }}>
          <div>
            {t('print.customer')}: <strong>{data.customerName}</strong>
          </div>
          <div>{data.customerAddress}</div>
          <div>{data.customerPhone}</div>
        </Row>

        <Row style={{ marginTop: 48 }}>
          <Table dataSource={data.items} columns={tableColumns} pagination={false} style={{ width: '100%' }} />
        </Row>

        <Row style={{ marginTop: 48 }}>
          <Col span={8} offset={16}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <th className='text-right'>{t('print.grossTotal')}:</th>
                  <td className='text-right'>
                    {data.total.toLocaleString()} {CURRENCY}
                  </td>
                </tr>
                <tr>
                  <th className='text-right'>{t('print.vat', { rate: VAT_RATE })}:</th>
                  <td className='text-right'>
                    {data.vat.toLocaleString()} {CURRENCY}
                  </td>
                </tr>
                <tr>
                  <th className='text-right'>{t('print.grandTotal')}:</th>
                  <td className='text-right'>
                    {data.grandTotal.toLocaleString()} {CURRENCY}
                  </td>
                </tr>
              </tbody>
            </table>
          </Col>
        </Row>

        <PrintSignBox
          title={t('print.authorizedSignature')}
          name={t('print.authorizedName')}
          position={t('print.authorizedPosition')}
          date={data.bookingDate}
        />

        <PrintFooter text={t('print.thankYou')} />
      </PrintContainer>
    </BeforePrint>
  );
};

export default BookingLicence;
