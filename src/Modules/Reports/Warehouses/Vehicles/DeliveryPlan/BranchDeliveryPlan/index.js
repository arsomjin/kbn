import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { Col, Container, Row } from 'shards-react';
import moment from 'moment';
import { getColums, getBranchDeliveryPlanData, expandedRowRender } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { showWarn } from 'functions';
import { h } from 'api';
import { DatePicker } from 'elements';
import PageTitle from 'components/common/PageTitle';
import BranchSelector from 'components/BranchSelector';
import { useSelector } from 'react-redux';
import { useMergeState } from 'api/CustomHooks';
import { getBranchName } from 'Modules/Utils';

export default () => {
  const { user } = useSelector(state => state.auth);
  const { employees } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useMergeState({
    month: moment().format('YYYY-MM'),
    branchCode: user.branch || '0450'
  });

  const _onValuesChange = val => {
    //  showLog({ val });
    setHeaders(val);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        let result = await getBranchDeliveryPlanData(headers);
        setLoading(false);
        setData(result);
      } catch (e) {
        showWarn(e);
      }
    };

    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers]);

  const mColumns = getColums(employees);

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          month: moment().format('YYYY-MM'),
          branchCode: user.branch || '0450'
        }}
        // layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white">
                <PageTitle
                  sm="8"
                  title="แผนขนส่ง โอนย้ายสินค้า"
                  subtitle="รายงาน - คลังสินค้า"
                  className="text-sm-left"
                />
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
                </Row>
              </div>
            </>
          );
        }}
      </Form>
      <div className="d-flex justify-content-center">
        <label className="text-primary p-3">{`แผนการขนส่ง โอนย้ายสินค้า ${getBranchName(
          headers.branchCode
        )} ประจำเดือน ${moment(headers.month, 'YYYY-MM').format('MMMM YYYY')}`}</label>
      </div>
      <EditableCellTable
        dataSource={data}
        columns={mColumns}
        loading={loading}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={mColumns.length} startAt={10} sumKeys={['qty']} />
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
