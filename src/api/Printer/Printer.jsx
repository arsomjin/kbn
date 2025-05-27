import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useMergeState } from '../CustomHooks';
import { Modal, Button } from 'elements';
import PrintComponent from 'components/PrintComponent';
import { Row } from 'antd';

const Printer = forwardRef((props, ref) => {
  const [cState, setCState] = useMergeState({
    show: false,
    ComponentToPrint: null,
    onAfterPrint: () => console.log('after_print'),
    fileName: `document-${Date.now()}`,
  });

  const _setNewState = useCallback(
    (mProps) => {
      setCState({
        show: typeof mProps.show !== 'undefined' ? mProps.show : false,
        ComponentToPrint: mProps.ComponentToPrint || null,
        onAfterPrint: () =>
          mProps.onAfterPrint ? mProps.onAfterPrint() : console.log('after_print'),
        fileName: mProps.fileName || cState.fileName,
      });
    },
    [setCState],
  );

  const _show = useCallback(
    (mProps) => {
      setCState({
        show: true,
        ComponentToPrint: mProps.ComponentToPrint || null,
        onAfterPrint: () =>
          mProps.onAfterPrint ? mProps.onAfterPrint() : console.log('after_print'),
        fileName: mProps.fileName || cState.fileName,
      });
    },
    [setCState],
  );

  const _hide = useCallback(() => {
    setCState({ show: false });
  }, [setCState]);

  useImperativeHandle(
    ref,
    () => ({
      setNewState: (mProps) => _setNewState(mProps),
      showPrint: (mProps) => _show(mProps),
      hidePrint: () => _hide(),
    }),
    [_hide, _setNewState, _show],
  );

  const _onCancel = () =>
    setCState({
      show: false,
      ComponentToPrint: null,
      onAfterPrint: () => console.log('after_print'),
      fileName: `document-${Date.now()}`,
    });

  if (!cState.show) {
    return null;
  }

  return (
    <Modal
      visible={cState.show}
      onCancel={_onCancel}
      isFull
      footer={
        <Row
          justify="end"
          style={{
            margin: 10,
          }}
        >
          <Button key="cancel" onClick={_onCancel} style={{ width: 120, marginRight: 10 }}>
            ยกเลิก
          </Button>
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
              width: 120,
            }}
            onAfterPrint={cState.onAfterPrint}
          />
        </Row>
      }
    >
      <div className="p-4" style={{ backgroundColor: 'lightgrey' }}>
        <cState.ComponentToPrint />
      </div>
    </Modal>
  );
});

export default Printer;
