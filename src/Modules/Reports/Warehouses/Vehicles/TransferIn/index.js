import React, { useEffect, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form } from 'antd';
import { Col, Container, Row } from 'shards-react';
import moment from 'moment';
import { columns, getVehicleTransferInData, expandedRowRender } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { showWarn } from 'functions';
import { h } from 'api';
import { DatePicker } from 'elements';
import PageTitle from 'components/common/PageTitle';
import BranchSelector from 'components/BranchSelector';
import { VehicleType } from 'data/Constant';
import CommonSelector from 'components/CommonSelector';
import { useSelector } from 'react-redux';
import { useMergeState } from 'api/CustomHooks';

export default () => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const { branches } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useMergeState({
    fArr: [],
    bColumns: [],
    mData: [],
    dBranches: []
  });
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useMergeState({
    month: moment().format('YYYY-MM'),
    branchCode: user.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    vehicleType: 'รถแทรกเตอร์'
  });

  const _onValuesChange = val => {
    //  showLog({ val });
    setHeaders(val);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        let result = await getVehicleTransferInData({ ...headers, branches });
        setLoading(false);
        setData(result);
      } catch (e) {
        showWarn(e);
      }
    };

    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches, headers]);

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          month: moment().format('YYYY-MM'),
          branchCode: user.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          vehicleType: 'รถแทรกเตอร์'
        }}
        // layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white">
                <PageTitle sm="8" title="การรับโอน(เข้า)" subtitle="รายงาน - คลังสินค้า" className="text-sm-left" />
              </div>
              <div className="pt-3 px-3">
                <Row>
                  <Col md="3">
                    <Form.Item name="month" label="ประจำเดือน">
                      <DatePicker
                        picker="month"
                        // size="middle"
                        className="text-primary"
                      />
                    </Form.Item>
                  </Col>
                  <Col md="3">
                    <Form.Item name="branchCode" label="สาขา">
                      <BranchSelector className="text-primary" hasAll onlyUserBranch={user.branch} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="vehicleType" label="ประเภท">
                      <CommonSelector
                        size={'small'}
                        placeholder="ประเภท"
                        // dropdownStyle={{ minWidth: 220 }}
                        optionData={VehicleType.concat(['ทั้งหมด'])}
                        className="text-primary"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data.mData}
        columns={[
          {
            title: '#',
            dataIndex: 'id',
            align: 'center'
          },
          {
            title: 'รายการ',
            dataIndex: 'vehicleType'
          }
        ].concat([...data.bColumns, { title: 'รวม', dataIndex: 'qty', align: 'center' }])}
        loading={loading}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={columns.length}
            startAt={1}
            sumKeys={[...data.dBranches, 'qty']}
            align="center"
          />
        )}
        pagination={false}
        // scroll={{ y: h(80) }}
      />
      <div className="d-flex justify-content-center mt-3">
        <label className="text-primary p-3">{`รายการรับโอน ${headers.vehicleType}`}</label>
      </div>
      <EditableCellTable
        dataSource={data.fArr}
        columns={columns}
        loading={loading}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={columns.length} startAt={8} sumKeys={['qty']} />
        )}
        // pagination={{ pageSize: 50 }}
        scroll={{ y: h(80) }}
        expandable={{
          expandedRowRender
        }}
      />
    </Container>
  );
};
