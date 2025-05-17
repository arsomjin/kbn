import React from 'react';
import { Row, Checkbox, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { Button } from 'elements';
import { BeforePrintProps } from './types';

const BeforePrint: React.FC<BeforePrintProps> = ({ onBeforePrint, children }) => {
  const { t } = useTranslation('common');
  const [visible, setVisible] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>(['original']);

  const handleOk = async () => {
    if (onBeforePrint) {
      const canPrint = await onBeforePrint();
      if (canPrint) {
        window.print();
      }
    } else {
      window.print();
    }
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleChange = (checkedValues: string[]) => {
    setSelectedOptions(checkedValues);
  };

  return (
    <>
      <div onClick={() => setVisible(true)}>{children}</div>
      <Modal
        title={<h5 className="text-primary">{t('print.title')}</h5>}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={
          <Row
            style={{
              justifyContent: 'flex-end',
              margin: 8
            }}
          >
            <Button key="cancel" onClick={handleCancel} style={{ width: 120 }} className="mr-1">
              {t('common.cancel')}
            </Button>
            <Button
              key="print"
              onClick={handleOk}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: 120
              }}
              type="primary"
            >
              {t('print.print')}
            </Button>
          </Row>
        }
      >
        <div className="d-flex justify-content-center align-items-center">
          <h6 className="mr-4" style={{ marginTop: 8 }}>
            {t('print.documentType')}
          </h6>
          <Checkbox.Group 
            options={[
              { label: t('print.original'), value: 'original' },
              { label: t('print.copy'), value: 'copy' }
            ]} 
            value={selectedOptions}
            onChange={handleChange} 
          />
        </div>
      </Modal>
    </>
  );
};

export default BeforePrint;
