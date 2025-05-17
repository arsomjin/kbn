import React from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { PrintSignBoxProps } from './types';

const PrintSignBox: React.FC<PrintSignBoxProps> = ({ title, name, position, date, className }) => {
  const { t } = useTranslation('common');

  return (
    <Row className={className}>
      <Col span={24}>
        <div style={{ marginTop: 48 }}>
          <div style={{ marginBottom: 16 }}>{title}</div>
          <div style={{ marginTop: 48 }}>
            <div>{name}</div>
            <div>{position}</div>
            {date && <div>{t('print.date')}: {date}</div>}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default PrintSignBox; 