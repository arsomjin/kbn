import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { waitFor } from '../../functions';
import { useMergeState } from '../CustomHooks';
import { Modal } from 'antd';

const AlertDialog = forwardRef((props, ref) => {
  const [cState, setCState] = useMergeState({
    visible: false,
    title: 'Alert',
    info: 'Information',
    theme: 'primary',
    onOk: () => {}
  });

  const _hide = useCallback(() => {
    setCState({ visible: false });
  }, [setCState]);

  const _setNewState = useCallback(
    mProps => {
      // showLog('newStates', mProps);
      setCState({
        visible: typeof mProps.visible !== 'undefined' ? mProps.visible : false,
        title: mProps.title || 'Alert',
        info: typeof mProps.info !== 'undefined' ? mProps.info : 'Information',
        theme: mProps.theme || 'primary',
        onOk: () => (mProps.onOk ? mProps.onOk() : _hide())
      });
    },
    [_hide, setCState]
  );

  const _show = useCallback(
    async mProps => {
      // showLog('newStates', mProps);
      setCState({
        visible: true,
        title: mProps.title || 'Alert',
        info: typeof mProps.info !== 'undefined' ? mProps.info : 'Information',
        theme: mProps.theme || 'primary',
        onOk: () => (mProps.onOk ? mProps.onOk() : _hide())
      });
      await waitFor(5000);
      _hide();
    },
    [_hide, setCState]
  );

  // const loadRef = useRef(null);
  // const combinedRef = useCombinedRefs(ref, loadRef);

  useImperativeHandle(
    ref,
    () => ({
      setNewState: mProps => _setNewState(mProps),
      showAlert: mProps => _show(mProps),
      hideAlert: () => _hide()
    }),
    [_hide, _setNewState, _show]
  );

  if (!cState.visible) {
    return null;
  }

  // showLog('Render_Alert', cState);
  return (
    <Modal
      title={cState.title}
      visible={cState.visible}
      onOk={cState.onOk}
      toggle={() => {}}
      // onCancel={_hide}
    >
      <p>{cState.info}</p>
    </Modal>
  );
});

export default AlertDialog;
