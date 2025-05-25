import React, { useContext, useState } from 'react';
import { useMergeState } from 'hooks';
import Load from 'ui/components/common/Load';
import ProgressLoader from 'ui/components/common/ProgressLoader';
import Updater from 'ui/components/common/Updater';
import { useResponsive } from './useResponsive';
import { Modal } from 'antd';
const LoadingContext = React.createContext();

export const LoadingProvider = ({ children }) => {
  const { mobileOnly } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [progressing, setProgress] = useMergeState({
    show: false,
    percent: 0,
    text: null,
    subtext: null,
    onCancel: null,
  });
  const [modal, setModal] = useMergeState({
    open: false,
    footer: undefined,
    content: null,
    title: null,
    width: null,
    onOk: null,
    onCancel: null,
  });
  const [updating, setUpdate] = useMergeState({
    show: false,
    text: undefined,
  });
  return (
    <LoadingContext.Provider
      value={{
        loading,
        progressing,
        updating,
        modal,
        setLoading,
        setProgress,
        setUpdate,
        setModal,
      }}
    >
      {children}
      <Modal
        title={modal.title}
        centered
        open={modal.open}
        onOk={() => {
          modal.onOk && modal.onOk();
          setModal({ open: false });
        }}
        onCancel={() => {
          modal.onCancel && modal.onCancel();
          setModal({ open: false });
        }}
        width={modal.width || (mobileOnly ? '95%' : '70%')}
        bodyStyle={{ maxHeight: '90vh' }}
        footer={modal.footer}
        destroyOnClose
      >
        {modal.content}
      </Modal>
      <ProgressLoader {...progressing} />
      <Updater {...updating} />
      <Load loading={loading} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
