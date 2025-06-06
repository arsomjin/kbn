import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { waitFor } from '../../functions';
import { useMergeState } from '../CustomHooks';
import { Alert, Modal } from 'shards-react';

const MessageBar = forwardRef((props, ref) => {
  const [cState, setCState] = useMergeState({
    visible: false,
    title: 'Alert',
    info: 'Information',
    theme: 'primary',
    link: '#',
    linkLabel: ''
  });

  const _setNewState = useCallback(
    mProps => {
      // showLog('newStates', mProps);
      setCState({
        visible: typeof mProps.visible !== 'undefined' ? mProps.visible : false,
        title: mProps.title || 'Alert',
        info: typeof mProps.info !== 'undefined' ? mProps.info : 'Information',
        theme: mProps.theme || 'primary',
        link: mProps.link || '#',
        linkLabel: mProps.linkLabel || ''
      });
    },
    [setCState]
  );

  const _hide = useCallback(() => {
    setCState({ visible: false });
  }, [setCState]);

  const _show = useCallback(
    async mProps => {
      // showLog('newStates', mProps);
      setCState({
        visible: true,
        title: mProps.title || 'Alert',
        info: typeof mProps.info !== 'undefined' ? mProps.info : 'Information',
        theme: mProps.theme || 'primary',
        linkLabel: mProps.linkLabel || ''
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
      showMessageBar: mProps => _show(mProps),
      hideMessageBar: () => _hide()
    }),
    [_hide, _setNewState, _show]
  );

  if (!cState.visible) {
    return null;
  }

  // showLog('Render_MessageBar', cState);
  return (
    <Modal
      open={cState.visible}
      toggle={() => {
        _hide();
      }}
      backdrop
      style={{ backgroundColor: 'transparent' }}
    >
      <Alert theme={cState.theme}>
        {`${cState.title} - ${cState.info}`}
        <a className="alert-link" href={cState.link}>
          {cState.linkLabel ? `     -  ${cState.linkLabel}` : ''}
        </a>
      </Alert>
    </Modal>
  );
});

export default MessageBar;
