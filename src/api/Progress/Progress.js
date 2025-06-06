import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useMergeState } from '../CustomHooks';
import { styles } from 'styles';
import { Modal } from 'shards-react';
import { Progress } from 'elements';
import { Popconfirm } from 'antd';
import { Button } from 'elements';

const MProgress = forwardRef((props, ref) => {
  const [cState, setCState] = useMergeState({
    show: false,
    percent: 0,
    text: null,
    subtext: null,
    onCancel: null
  });

  const _hide = useCallback(() => {
    setCState({ show: false });
  }, [setCState]);

  const _setNewState = useCallback(
    mProps => {
      // showLog('newStates', mProps);
      setCState({
        show: typeof mProps.show !== 'undefined' ? mProps.show : false,
        percent: typeof mProps.percent !== 'undefined' ? mProps.percent : 0,
        text: mProps.text || null,
        subtext: mProps.subtext || null,
        onCancel: mProps.onCancel || null
      });
    },
    [setCState]
  );

  const _show = useCallback(
    mProps => {
      // showLog('newStates', mProps);
      setCState({
        show: true,
        percent: mProps.percent || 0,
        text: mProps.text || null,
        subtext: mProps.subtext || null,
        onCancel: mProps.onCancel || null
      });
    },
    [setCState]
  );

  // const loadRef = useRef(null);
  // const combinedRef = useCombinedRefs(ref, loadRef);

  useImperativeHandle(
    ref,
    () => ({
      setNewState: mProps => _setNewState(mProps),
      showProgress: mProps => _show(mProps),
      hideProgress: () => _hide()
    }),
    [_hide, _setNewState, _show]
  );

  if (!cState.show) {
    return null;
  }

  // showLog('Render_MProgress', cState);
  return (
    <Modal open={cState.show} centered toggle={() => {}}>
      <div
        style={{
          ...styles.centered,
          ...styles.middle,
          width: 320
        }}
        className="bg-light p-3 bordered rounded"
      >
        <div className="d-flex justify-content-center">
          <Progress {...{ percent: parseInt(cState.percent) }} />
        </div>
        {cState.text && (
          <div className="d-flex justify-content-center">
            <label className="text-primary my-3 text-center">{cState.text}</label>
          </div>
        )}
        {cState.subtext && (
          <div className="d-flex justify-content-center">
            <label className="text-warning mb-3 text-center">{cState.subtext}</label>
          </div>
        )}
        {cState.onCancel && (
          <div className="d-flex justify-content-center border-top mt-3 pt-3">
            <Popconfirm
              title="ยืนยัน?"
              okText="ยืนยัน ยกเลิกการดำเนินการ"
              cancelText="ยกเลิก"
              onConfirm={() => {
                cState.onCancel();
                _hide();
              }}
            >
              <Button className="mr-3" size="middle">
                ยกเลิก
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </Modal>
  );
});

export default MProgress;
