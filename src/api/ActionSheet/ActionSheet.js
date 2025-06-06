import React, { forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';

import { waitFor } from '../../functions';

import { useMergeState } from '../CustomHooks';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'shards-react';

export default forwardRef((props, ref) => {
  useEffect(() => {
    return () => clearInterval();
  }, []);

  const [cState, setCState] = useMergeState({
    visible: false,
    title: props.title || 'Confirm?',
    info: props.info || '',
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
        title: mProps.title || 'Confirm?',
        info: mProps.info || '',
        onClick: mProps.onClick || (() => {})
      });
      // await waitFor(5000);
      // _hide();
    },
    [setCState]
  );

  useImperativeHandle(
    ref,
    () => ({
      showActionSheet: mProps => _show(mProps),
      hideActionSheet: () => _hide()
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
      centered
    >
      <ModalHeader>{cState.title}</ModalHeader>
      <ModalBody>{cState.info}</ModalBody>
      <ModalFooter>
        <Button
          theme="light"
          onClick={() => {
            _hide();
          }}
        >
          ยกเลิก
        </Button>
        <Button
          onClick={() => {
            cState.onClick && cState.onClick();
            _hide();
          }}
        >
          ตกลง
        </Button>
      </ModalFooter>
    </Modal>
  );
});
