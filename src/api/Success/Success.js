import React, { forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';

import { tran } from '../../translations/i18n';
import { waitFor } from '../../functions';

import { useMergeState } from '../CustomHooks';
import { Button, Modal } from 'shards-react';
import { Result } from 'antd';

export default forwardRef((props, ref) => {
  useEffect(() => {
    return () => clearInterval();
  }, []);

  const [cState, setCState] = useMergeState({
    visible: false,
    info: props.info || tran('สำเร็จ'),
    unDismiss: props.unDismiss || false,
    onClick: props.onClick || (() => {})
  });

  const _hide = useCallback(async () => {
    setCState({ anim: 'fadeOutDown', easing: 'ease-out-quad' });
    await waitFor(0);
    setCState({ visible: false });
  }, [setCState]);

  const _show = useCallback(
    async mProps => {
      setCState({
        visible: true,
        info: mProps.info || tran('สำเร็จ'),
        unDismiss: mProps.unDismiss || false,
        onClick: mProps.onClick || (() => {})
      });
      if (!mProps.unDismiss) {
        await waitFor(5000);
        _hide();
      }
    },
    [_hide, setCState]
  );

  useImperativeHandle(
    ref,
    () => ({
      showSuccess: mProps => _show(mProps),
      hideSuccess: () => _hide()
    }),
    [_hide, _show]
  );

  if (!cState.visible) {
    return null;
  }

  return (
    <Modal
      open={cState.visible}
      toggle={() => {
        // cState.onClick && cState.onClick();
        _hide();
      }}
      backdrop
    >
      <Result
        status="success"
        title="สำเร็จ"
        subTitle={cState.info || 'ทำรายการเรียบร้อยแล้ว'}
        extra={[
          <Button
            key="okButton"
            outline
            onClick={() => {
              cState.onClick && cState.onClick();
              _hide();
            }}
          >
            ตกลง
          </Button>
        ]}
      />
    </Modal>
  );
});
