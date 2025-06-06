import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useMergeState } from '../CustomHooks';
import { styles } from 'styles';
import { Modal } from 'shards-react';
import { Spin } from 'antd';

const Loader = forwardRef((props, ref) => {
  const [cState, setCState] = useMergeState({
    loading: false,
    text: null,
    hideIndicator: false
  });

  const _setNewState = useCallback(
    mProps => {
      // showLog('newStates', mProps);
      setCState({
        loading: typeof mProps.loading !== 'undefined' ? mProps.loading : false,
        text: mProps.text || null,
        hideIndicator: typeof mProps.hideIndicator !== 'undefined' ? mProps.hideIndicator : false
      });
    },
    [setCState]
  );

  const _show = useCallback(
    mProps => {
      // showLog('newStates', mProps);
      setCState({
        loading: true,
        text: mProps.text || null,
        hideIndicator: typeof mProps.hideIndicator !== 'undefined' ? mProps.hideIndicator : false
      });
    },
    [setCState]
  );

  const _hide = useCallback(() => {
    setCState({ loading: false });
  }, [setCState]);

  // const loadRef = useRef(null);
  // const combinedRef = useCombinedRefs(ref, loadRef);

  useImperativeHandle(
    ref,
    () => ({
      setNewState: mProps => _setNewState(mProps),
      showLoad: mProps => _show(mProps),
      hideLoad: () => _hide()
    }),
    [_hide, _setNewState, _show]
  );

  if (!cState.loading) {
    return null;
  }

  // showLog('Render_Loader', cState);
  return (
    <Modal open={cState.loading} centered toggle={() => {}}>
      <div
        style={{
          ...styles.centered,
          ...styles.middle,
          maxWidth: 320
        }}
        {...(cState.text && { className: 'bg-light p-3 bordered rounded' })}
      >
        {!cState.hideIndicator && <Spin tip={cState.text} />}
        {/* <img
          alt="loading"
          src={require('images/loadingDot.gif')}
          style={styles.iconImage}
        /> */}
      </div>
    </Modal>
  );
});

export default Loader;
