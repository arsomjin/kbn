import React, { useEffect, useRef, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form, Modal } from 'antd';
import { Container, Row, Col } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, formatServiceType, serviceTypeSumKeys } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { TableSummary } from 'api/Table';
import { showWarn, firstKey } from 'functions';
import BranchYearHeader from 'components/branch-year-header';
import { getSearchData } from 'firebase/api';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { useMergeState } from 'api/CustomHooks';
import ServiceViewer from 'Modules/Service/Components/ServiceViewer';
import { h } from 'api';

export default () => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mColumns, setColumns] = useState(columns);
  const [showModal, setShowModal] = useMergeState({
    visible: false,
    service: {}
  });

  const searchValues = useRef({
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    year: moment().format('YYYY')
  });

  useEffect(() => {
    _onValuesChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onValuesChange = async val => {
    try {
      //  showLog({ val });
      let changeKey = firstKey(val);
      setLoading(true);
      searchValues.current = { ...searchValues.current, ...val };
      let sData = await getSearchData(
        'sections/services/serviceClose',
        { ...searchValues.current, ...val },
        ['recordedDate', 'serviceNo'],
        { date: 'recordedDate' }
      );

      let fData = await formatServiceType(sData);
      setData(fData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          isRange: false,
          year: moment(),
          yearRange: [moment().subtract(1, 'year'), moment()],
          vehicleGroup: 'tracktor'
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <div className="px-3 bg-white border-bottom">
              {/* <HiddenItem name="serviceId" /> */}
              <Row>
                <Col md="12">
                  <BranchYearHeader
                    title="สรุปแบ่งตามประเภท"
                    subtitle="รายงาน - งานบริการ"
                    // steps={CommonSteps}
                    activeStep={0}
                    isRange={values.isRange}
                    yearLabel="ประจำปี"
                    yearDisabled
                    onlyUserBranch={user.branch}
                  />
                </Col>
              </Row>
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
            startAt={0}
            sumKeys={serviceTypeSumKeys()}
            align="center"
          />
        )}
        pagination={{ pageSize: 50 }}
        scroll={{ y: h(80) }}
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
