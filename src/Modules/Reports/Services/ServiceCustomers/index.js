import React, { useEffect, useRef, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form, Modal } from 'antd';
import { Container, Row, Col } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { getColumns, formatServiceCustomers, serviceCustomerSumKeys } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { TableSummary } from 'api/Table';
import { showLog, showWarn, firstKey } from 'functions';
import BranchYearHeader from 'components/branch-year-header';
import { getSearchData } from 'firebase/api';
import { Button } from 'elements';
import { isMobile } from 'react-device-detect';
import { w } from 'api';
import { checkDoc } from 'firebase/api';
import { showAlert } from 'functions';
import { useMergeState } from 'api/CustomHooks';
import ServiceViewer from 'Modules/Service/Components/ServiceViewer';
import VehicleGroupSelector from 'components/VehicleGroupSelector';
import { InputGroup } from 'elements';
import { distinctArr } from 'functions';
import { h } from 'api';

export default () => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mColumns, setColumns] = useState(getColumns());
  const [vehicleGroup, setVehicleGroup] = useState('tracktor');
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
      if (changeKey === 'vehicleGroup') {
        setVehicleGroup(val[changeKey]);
        if (val[changeKey] === 'all') {
          setData(
            distinctArr(
              allData,
              ['serviceTitle'],
              ['count', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12']
            )
          );
        } else {
          setData(allData.filter(l => l.vGroup === val[changeKey]));
        }
      } else {
        setLoading(true);
        searchValues.current = { ...searchValues.current, ...val };
        let sData = await getSearchData(
          'sections/services/serviceClose',
          { ...searchValues.current, ...val },
          ['recordedDate', 'serviceNo'],
          { date: 'recordedDate' }
        );

        let fData = await formatServiceCustomers(sData);
        setAllData(fData);
        setData(
          vehicleGroup === 'all'
            ? distinctArr(
                fData,
                ['serviceTitle'],
                ['count', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12']
              )
            : fData.filter(l => l.vGroup === vehicleGroup)
        );
        setLoading(false);
      }
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

  showLog({ vehicleGroup });

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
                    title="จำนวนลูกค้าที่ใช้บริการ"
                    subtitle="รายงาน - งานบริการ"
                    // steps={CommonSteps}
                    activeStep={0}
                    isRange={values.isRange}
                    yearLabel="ประจำปี"
                    extraComponent={
                      <InputGroup
                        spans={[8, 16]}
                        addonBefore={'กลุ่มรถ'}
                        inputComponent={props => <VehicleGroupSelector hasAll {...props} />}
                        className="text-center"
                      />
                    }
                    extraName="vehicleGroup"
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
            sumKeys={serviceCustomerSumKeys()}
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
