import React, { useEffect, useState } from 'react';
import { CardFooter, Container } from 'shards-react';
import PageHeader from 'components/common/PageHeader';
import { showLog } from 'functions';
import EditableCellTable from 'components/EditableCellTable';
import { showWarn } from 'functions';
import { columns } from './api';
import { useSelector } from 'react-redux';
import { sortArr } from 'functions';
import { useHistory, useLocation } from 'react-router-dom';
import { Button } from 'elements';
import { ChevronLeftOutlined } from '@material-ui/icons';
import moment from 'moment-timezone';
import { Modal } from 'antd';
import { isMobile } from 'react-device-detect';
import { useMergeState } from 'api/CustomHooks';
import SaleViewer from 'Modules/Sales/Vehicles/SaleViewer';
import { w } from 'api';
import { checkDoc } from 'firebase/api';
import { showAlert } from 'api/AlertDialog/AlertManager';
import { getBranchName } from 'Modules/Utils';
import { h } from 'api';
export default () => {
  let location = useLocation();
  //  showLog('location', location.pathname);
  const params = location.state?.params;
  showLog({ params });
  const history = useHistory();
  const { record, onBack } = params;
  const { branches } = useSelector(state => state.data);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useMergeState({
    visible: false,
    sale: {}
  });

  const getData = async () => {
    try {
      setLoading(true);
      let { branchCode, date, saleType } = record;
      let arr = (params?.data || { all: [] }).all.filter(l =>
        branchCode !== 'all'
          ? l.branchCode === branchCode && l.date === date && l.saleType === saleType
          : l.date === date
      );
      arr = sortArr(arr, '-date').map((l, i) => ({
        ...l,
        qty: 1,
        id: i,
        key: i
      }));

      setData(arr);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = async record => {
    try {
      const doc = await checkDoc('sections', `sales/vehicles/${record.saleId}`);
      if (doc) {
        let sale = doc.data();
        setShowModal({ sale, visible: true });
      } else {
        showAlert('NO_BOOK_ID', record?.saleId);
      }
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <Container fluid className="main-content-container px-4">
      <PageHeader
        subtitle={`ประจำวัน${
          params?.record ? (params.record?.date ? `ที่ ${moment(params.record.date).format('D MMMM YYYY')}` : '') : ''
        } ${params.record?.branchCode ? getBranchName(params.record.branchCode) : ''}`}
        title="รายงานการขาย"
      />
      <EditableCellTable
        dataSource={data}
        columns={columns}
        // onUpdate={onUpdate}
        loading={loading}
        onRow={(record, rowIndex) => {
          return {
            onClick: () => handleSelect(record)
          };
        }}
        hasChevron
        pagination={{ pageSize: 100 }}
        scroll={{ y: h(70) }}
      />
      <CardFooter className="d-flex  m-3">
        <Button
          onClick={() => history.push(onBack.path, { params: onBack })}
          size="middle"
          icon={<ChevronLeftOutlined />}
          className="mr-3"
        >
          {'กลับ'}
        </Button>
      </CardFooter>
      <Modal
        visible={showModal.visible}
        onCancel={() => setShowModal({ visible: false, sale: {} })}
        footer={[
          <Button key="close" onClick={() => setShowModal({ visible: false, sale: {} })}>
            ปิด
          </Button>
        ]}
        cancelText="ปิด"
        width={isMobile ? '90vw' : '77vw'}
        style={{ left: isMobile ? 0 : w(7) }}
        destroyOnClose
      >
        <SaleViewer {...{ sale: showModal.sale, grant: true, readOnly: true }} />
      </Modal>
    </Container>
  );
};
