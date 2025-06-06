import React, { useRef, useState } from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, formatExpenseSummary, expandedRowRender } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { showLog, showWarn } from 'functions';
import BranchMonthHeader from 'components/branch-month-header';
import { h } from 'api';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { TableSummary } from 'api/Table';
import numeral from 'numeral';

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

      let fData = await formatExpenseSummary({ ...queries, branches });
      showLog({ fData });
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
                title="ใบกำกับภาษีซื้ออะไหล่ - สำนักงานใหญ่"
                subtitle="รายงาน - บัญชี - ภาษี"
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
                sm="8"
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
        expandable={{
          expandedRowRender,
          rowExpandable: record => !!record.items
        }}
        loading={loading}
        // pagination={{ pageSize: daysInMonth(searchValues.current.month) }}
        pagination={{ pageSize: 1000 }}
        scroll={{ y: h(80) }}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={data.length}
            startAt={4}
            sumKeys={['total', 'billVAT', 'billTotal']}
            // label={`รวม ${data.length} บิล`}
            label={
              <div>
                รวม
                <span className="text-success text-semibold px-2">{numeral(data.length).format('0,0')}</span>
                บิล
              </div>
            }
          />
        )}
      />
    </Container>
  );
};
