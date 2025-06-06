import React, { useEffect, useRef, useState } from 'react';
import { Form, Modal } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, formatServiceDailyList, serviceDailySumKeys } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { TableSummary } from 'api/Table';
import { showWarn } from 'functions';
import BranchMonthHeader from 'components/branch-month-header';
import { getSearchData } from 'firebase/api';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { checkDoc } from 'firebase/api';
import { showAlert } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import ServiceViewer from 'Modules/Service/Components/ServiceViewer';

export default () => {
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mColumns, setColumns] = useState(columns);
  const [showModal, setShowModal] = useMergeState({
    visible: false,
    service: {}
  });

  const searchValues = useRef({
    branchCode: user?.branch || '0450',
    month: moment().format('YYYY-MM')
  });

  useEffect(() => {
    _onValuesChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onValuesChange = async val => {
    try {
      //  showLog({ val });
      setLoading(true);
      searchValues.current = { ...searchValues.current, ...val };
      let sData = await getSearchData(
        'sections/services/serviceClose',
        { ...searchValues.current, ...val },
        ['recordedDate', 'serviceNo'],
        { date: 'recordedDate' }
      );

      let fData = await formatServiceDailyList(sData);
      setData(fData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const handleSelect = async record => {
    try {
      const doc = await checkDoc('sections', `services/serviceClose/${record.serviceId}`);
      if (doc) {
        let service = doc.data();
        setShowModal({ service, visible: true });
      } else {
        showAlert('NO_SERVICE_ID', record?.serviceId);
      }
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || '0450',
          isRange: false,
          month: moment(),
          monthRange: [moment().subtract(1, 'month'), moment()]
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <div className="px-3 bg-white border-bottom">
              {/* <HiddenItem name="serviceId" /> */}
              <BranchMonthHeader
                title="บันทึกประจำวัน"
                subtitle="รายงาน - งานบริการ"
                // steps={CommonSteps}
                activeStep={0}
                isRange={values.isRange}
                dateLabel="ประจำเดือน"
                disableAllBranches
                onlyUserBranch={user.branch}
              />
            </div>
          );
        }}
      </Form>
      <EditableRowTable
        dataSource={data}
        columns={mColumns}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={mColumns.length}
            startAt={5}
            sumKeys={serviceDailySumKeys}
            align="center"
          />
        )}
        // onRow={(record, rowIndex) => {
        //   return {
        //     onClick: () => handleSelect(record),
        //   };
        // }}
        // hasChevron
        pagination={{ pageSize: 50 }}
      />
      <Modal
        visible={showModal.visible}
        onCancel={() => setShowModal({ visible: false, service: {} })}
        footer={[
          <Button key="close" onClick={() => setShowModal({ visible: false, service: {} })}>
            ปิด
          </Button>
        ]}
        cancelText="ปิด"
        width={isMobile ? '90vw' : '77vw'}
        style={{ left: isMobile ? 0 : w(7) }}
        destroyOnClose
      >
        <ServiceViewer {...{ service: showModal.service, grant: true, readOnly: true }} />
      </Modal>
    </Container>
  );
};
