import React, { useRef, useState } from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, formatIncomeSummary } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn } from 'functions';
import BranchMonthHeader from 'components/branch-month-header';
import { h } from 'api';
import { daysInMonth } from 'functions';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { TableSummary } from 'api/Table';

export default () => {
  const { branches } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchValues = useRef({
    // branchCode: user?.branch || '0450',
    month: moment().format('YYYY-MM')
  });

  const _onValuesChange = val => {
    searchValues.current = { ...searchValues.current, ...val };
    setData([]);
  };

  const _onUpdate = async val => {
    try {
      //  showLog({ val });
      setLoading(true);
      let queries = {
        ...searchValues.current
      };
      // let sData = await getSearchData('sections/account/incomes', queries);

      let fData = await formatIncomeSummary({ ...queries, branches });
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
          // branchCode: user?.branch || '0450',
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
              {/* <HiddenItem name="incomeId" /> */}
              <BranchMonthHeader
                title="แยกขายอะไหล่ KBN"
                subtitle="รายงาน - บัญชี - รายรับ"
                activeStep={0}
                isRange={values.isRange}
                disableAllBranches
                extraComponent={
                  <Button onClick={_onUpdate} disabled={loading} type="primary" icon={<Check />} loading={loading}>
                    {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                  </Button>
                }
                disabled={loading}
                onlyMonth
              />
            </div>
          );
        }}
      </Form>
      {loading && (
        <div className="d-flex align-items-center justify-content-center">
          <label className="text-primary mt-3">กำลังคำนวณ...</label>
        </div>
      )}
      <EditableRowTable
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: daysInMonth(searchValues.current.month) }}
        scroll={{ y: h(70) }}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={data.length}
            startAt={1}
            sumKeys={['amtIntake', 'amtFieldMeter', 'amtBattery', 'amtTyre', 'amtGPS', 'amtOther']}
          />
        )}
      />
    </Container>
  );
};
