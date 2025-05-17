import React from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { PrintHeaderProps } from './types';

const PrintHeader: React.FC<PrintHeaderProps> = ({ title, subtitle, logo, className }) => {
  const { t } = useTranslation('common');

  return (
    <Row style={{ justifyContent: 'center' }} className={className}>
      <Col style={{ alignItems: 'center' }}>
        {logo && <img src={logo} alt={t('print.logo')} style={{ maxHeight: 60, marginBottom: 16 }} />}
        <h3>{title}</h3>
        {subtitle && <h5 className="text-muted text-center">{subtitle}</h5>}
      </Col>
    </Row>
  );
};

export default PrintHeader; 