import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Modal } from 'antd';
import { Container, Row, Col } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { getColumns, formatAttendance, attendanceSumKeys, createInitSnap } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { TableSummary } from 'api/Table';
import { showWarn, firstKey } from 'functions';
import { getSearchData } from 'firebase/api';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { checkDoc } from 'firebase/api';
import { showAlert } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import ServiceViewer from 'Modules/Service/Components/ServiceViewer';
import { distinctArr } from 'functions';
import { h } from 'api';
import { FirebaseContext } from '../../../../firebase';
import { DatePicker } from 'elements';
import PageTitle from 'components/common/PageTitle';

export default () => {
  const { api } = useContext(FirebaseContext);

  const { user } = useSelector(state => state.auth);
  const { employees } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mColumns, setColumns] = useState([]);
  const [showModal, setShowModal] = useMergeState({
    visible: false,
    service: {}
  });

  const searchValues = useRef({
    // branchCode: user?.branch || '0450',
    year: moment().format('YYYY')
  });

  useEffect(() => {
    api.getEmployees();
    _onValuesChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onValuesChange = async val => {
    try {
      //  showLog({ val });
      let changeKey = firstKey(val);
      setLoading(true);
      searchValues.current = { ...searchValues.current, ...val };
      let sData = await getSearchData('sections/hr/leave', { ...searchValues.current, ...val }, ['fromDate', 'docId'], {
        date: 'fromDate'
      });

      let fData = await formatAttendance(sData, employees);
      setAllData(fData);
      let nData = distinctArr(fData, ['employeeCode'], ['count', ...Object.keys(createInitSnap()).map(k => k)]);
      let arr = nData.map((it, id) => ({ ...it, id, key: id }));
      setData(arr);
      setColumns(getColumns(moment().format('YYYY'), arr));
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const handleSelect = async record => {
    try {
      const doc = await checkDoc('sections', `hr/leave/${record.docId}`);
      if (doc) {
        let service = doc.data();
        setShowModal({ service, visible: true });
      } else {
        showAlert('NO_SERVICE_ID', record?.docId);
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
          // branchCode: user?.branch || '0450',
          isRange: false,
          year: moment(),
          yearRange: [moment().subtract(1, 'year'), moment()]
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <div className="px-3 bg-white border-bottom">
              <Row className="px-3 pt-3 border-bottom">
                <PageTitle sm="4" title="สถิติการทำงาน" subtitle="รายงาน ฝ่ายบุคคล" className="text-sm-left" />
                {/* <Col md="4">
                  <Form.Item
                    // label="สาขา"
                    name={'branch'}
                  >
                    <InputGroup
                      spans={[8, 16]}
                      addonBefore={'สาขา'}
                      inputComponent={(props) => (
                        <CommonSelector
                          optionData={distinctArr(data, ['affiliate'])
                            .map((it) => it.affiliate)
                            .filter((l) => !!l)}
                          className="text-success text-center"
                          hasAll
                          placeholder="สาขา"
                          {...props}
                        />
                      )}
                      className="text-center"
                    />
                  </Form.Item>
                </Col> */}
                <Col md="4">
                  <Form.Item label={'ประจำปี'} name={'year'}>
                    <DatePicker picker="year" disabled />
                  </Form.Item>
                </Col>
              </Row>
              {/* <Row>
                <Col md="12">
                  <BranchYearHeader
                    title="สถิติการทำงาน"
                    subtitle="รายงาน - ฝ่ายบุคคล"
                    // steps={CommonSteps}
                    activeStep={0}
                    isRange={values.isRange}
                    yearLabel="ประจำปี"
                    yearDisabled
                  />
                </Col>
              </Row> */}
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
            startAt={3}
            sumKeys={attendanceSumKeys()}
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
