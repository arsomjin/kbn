import React, { useRef, useState } from 'react';
import { Form } from 'antd';
import { Container, Row, Col } from 'shards-react';
import { isMobile } from 'react-device-detect';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import PageTitle from 'components/common/PageTitle';
import { DatePicker } from 'elements';
import moment from 'moment-timezone';
import { getColumns, getDailyCreditData, sumKeys } from './api';
import { showWarn } from 'functions';
import EditableRowTable from 'components/EditableRowTable';
import { h } from 'api';
import { TableSummary } from 'api/Table';
import VehicleGroupSelector from 'components/VehicleGroupSelector';
import { firstKey } from 'functions';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { InputGroup } from 'elements';

export default () => {
  let location = useLocation();
  const params = location.state?.params;
  const history = useHistory();

  const { user } = useSelector(state => state.auth);
  const { branches } = useSelector(state => state.data);

  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [vehicle, setVGroup] = useState('tracktor');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const searchValues = useRef({
    date: moment().format('YYYY-MM-DD'),
    vehicle: 'tracktor',
    branches
  });

  const _onValuesChange = val => {
    if (firstKey(val) === 'date') {
      setDate(val['date']);
    } else {
      setVGroup(val['vehicle']);
    }
    searchValues.current = { ...searchValues.current, ...val };
  };

  const _onUpdate = async () => {
    try {
      setLoading(true);
      let cData = await getDailyCreditData(searchValues.current);
      setData(cData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
    }
  };

  const columns = getColumns(date);

  return (
    <Container fluid className={`main-content-container ${isMobile ? '' : 'p-3'}`}>
      <PageTitle sm="6" title="สรุปยอดประจำวัน (สินเชื่อ)" subtitle="สินเชื่อ" className="text-sm-left mt-3" />
      <Form
        form={form}
        onValuesChange={_onValuesChange}
        initialValues={{
          date: moment().format('YYYY-MM-DD'),
          vehicle: 'tracktor'
        }}
        size="small"
        layout="vertical"
      >
        <Row className="px-3 pt-3 border-bottom">
          <Col md="3">
            <Form.Item name="date">
              <InputGroup
                spans={[8, 16]}
                addonBefore={'วันที่'}
                inputComponent={props => <DatePicker placeholder="เลือกวันที่" {...props} />}
                className="text-center"
              />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="vehicle">
              <InputGroup
                spans={[8, 16]}
                addonBefore={'ประเภท'}
                inputComponent={props => <VehicleGroupSelector hasAll hasDrone {...props} />}
                className="text-center"
              />
            </Form.Item>
          </Col>
          <Col md="3">
            <Button onClick={_onUpdate} disabled={loading} type="primary" icon={<Check />} loading={loading}>
              {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
            </Button>
          </Col>
        </Row>
      </Form>

      <EditableRowTable
        dataSource={data}
        columns={columns}
        loading={loading}
        scroll={{ y: h(80) }}
        pagination={{ pageSize: 50, hideOnSinglePage: true }}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={columns.length}
            startAt={0}
            sumKeys={sumKeys}
            align="center"
            labelAlign="center"
            noDecimal
          />
        )}
      />
    </Container>
  );
};
