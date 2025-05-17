import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
import { Popconfirm, Modal } from 'antd';
import { useMergeState } from 'hooks/useMergeState';
import { Button, Progress } from 'elements';
import { useTranslation } from 'react-i18next';

interface ProgressState extends Record<string, unknown> {
  show: boolean;
  percent: number;
  text: string | null;
  subtext: string | null;
  onCancel: (() => void) | null;
}

export interface ProgressRef {
  setNewState: (props: Partial<ProgressState>) => void;
  showProgress: (props: Partial<ProgressState>) => void;
  hideProgress: () => void;
}

const MProgress = forwardRef<ProgressRef>((_, ref) => {
  const { t } = useTranslation();
  const [cState, setCState] = useMergeState<ProgressState>({
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
    (mProps: Partial<ProgressState>) => {
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
    (mProps: Partial<ProgressState>) => {
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

  useImperativeHandle(
    ref,
    () => ({
      setNewState: (mProps: Partial<ProgressState>) => _setNewState(mProps),
      showProgress: (mProps: Partial<ProgressState>) => _show(mProps),
      hideProgress: () => _hide()
    }),
    [_hide, _setNewState, _show]
  );

  if (!cState.show) {
    return null;
  }

  return (
    <Modal open={cState.show} centered footer={null} closable={false}>
      <div className="flex flex-col items-center justify-center w-80 p-3 bg-white rounded-lg shadow">
        <div className="flex justify-center">
          <Progress percent={Math.round(cState.percent)} />
        </div>
        {cState.text && (
          <div className="flex justify-center">
            <label className="text-primary my-3 text-center">{cState.text}</label>
          </div>
        )}
        {cState.subtext && (
          <div className="flex justify-center">
            <label className="text-warning mb-3 text-center">{cState.subtext}</label>
          </div>
        )}
        {cState.onCancel && (
          <div className="flex justify-center border-t mt-3 pt-3">
            <Popconfirm
              title={t('common.confirm')}
              okText={t('common.confirmCancel')}
              cancelText={t('common.cancel')}
              onConfirm={() => {
                cState.onCancel?.();
                _hide();
              }}
            >
              <Button className="mr-3" size="middle">
                {t('common.cancel')}
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
    </Modal>
  );
});

MProgress.displayName = 'MProgress';

export default MProgress; 