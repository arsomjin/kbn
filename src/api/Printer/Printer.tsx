import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useMergeState } from 'hooks/useMergeState';
import { Modal, Button } from 'antd';
import PrintComponent from 'components/PrintComponent';
import { Row } from 'antd';
import { PrinterState, PrinterRef } from './types';
import { useTranslation } from 'react-i18next';

const Printer = forwardRef<PrinterRef>((_, ref) => {
  const { t } = useTranslation('printer');
  const [cState, setCState] = useMergeState<PrinterState>({
    show: false,
    ComponentToPrint: null,
    onAfterPrint: () => console.log('after_print'),
    fileName: `document-${Date.now()}`
  });

  const _setNewState = useCallback(
    (mProps: Partial<PrinterState>) => {
      setCState({
        show: typeof mProps.show !== 'undefined' ? mProps.show : false,
        ComponentToPrint: mProps.ComponentToPrint || null,
        onAfterPrint: () => (mProps.onAfterPrint ? mProps.onAfterPrint() : console.log('after_print')),
        fileName: mProps.fileName || cState.fileName
      });
    },
    [setCState, cState.fileName]
  );

  const _show = useCallback(
    (mProps: Partial<PrinterState>) => {
      setCState({
        show: true,
        ComponentToPrint: mProps.ComponentToPrint || null,
        onAfterPrint: () => (mProps.onAfterPrint ? mProps.onAfterPrint() : console.log('after_print')),
        fileName: mProps.fileName || cState.fileName
      });
    },
    [setCState, cState.fileName]
  );

  const _hide = useCallback(() => {
    setCState({ show: false });
  }, [setCState]);

  useImperativeHandle(
    ref,
    () => ({
      setNewState: _setNewState,
      showPrint: _show,
      hidePrint: _hide
    }),
    [_hide, _setNewState, _show]
  );

  const _onCancel = () =>
    setCState({
      show: false,
      ComponentToPrint: null,
      onAfterPrint: () => console.log('after_print'),
      fileName: `document-${Date.now()}`
    });

  if (!cState.show) {
    return null;
  }

  return (
    <Modal
      open={cState.show}
      onCancel={_onCancel}
      width="100%"
      footer={
        <Row
          style={{
            justifyContent: 'flex-end',
            margin: 10
          }}
        >
          <Button key="cancel" onClick={_onCancel} style={{ width: 120, marginRight: 10 }}>
            {t('cancel')}
          </Button>
          {cState.ComponentToPrint && (
            <PrintComponent
              key="print"
              ComponentToPrint={cState.ComponentToPrint}
              fileName={cState.fileName}
              hideComponent
              type="primary"
              buttonStyle={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: 120
              }}
              onAfterPrint={cState.onAfterPrint}
            />
          )}
        </Row>
      }
    >
      <div className="p-4" style={{ backgroundColor: 'lightgrey' }}>
        {cState.ComponentToPrint && <cState.ComponentToPrint />}
      </div>
    </Modal>
  );
});

export default Printer; 