import React from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { PrintConsentProps } from './types';

const PrintConsent: React.FC<PrintConsentProps> = ({ text, signature, date, className }) => {
  const { t } = useTranslation('common');

  return (
    <Row className={className}>
      <Col span={24}>
        <div style={{ marginTop: 24 }}>
          <div>{text}</div>
          {signature && (
            <div style={{ marginTop: 24 }}>
              <div>
                {t('print.signature')}: {signature}
              </div>
              {date && (
                <div>
                  {t('print.date')}: {date}
                </div>
              )}
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default PrintConsent;
