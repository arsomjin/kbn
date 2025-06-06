import React, { useRef, useState } from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, eColumns, formatIncomeSummary } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { showLog, showWarn } from 'functions';
import BranchMonthHeader from 'components/branch-month-header';
import { h } from 'api';
import { daysInMonth } from 'functions';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { TableSummary } from 'api/Table';
import ExcelExport from 'Modules/Utils/Excels/ExcelExport';

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

  const eData = data.map(it => {
    let arr = [];
    eColumns.map(lb => {
      arr.push({
        value:
          lb.dataIndex === 'date'
            ? moment(it[lb.dataIndex], 'YYYY-MM-D').add(543, 'year').locale('th').format('D MMM YY')
            : lb.dataIndex === 'branchCode'
              ? it[lb.dataIndex] && branches[it[lb.dataIndex]]
                ? branches[it[lb.dataIndex]].branchName
                : it[lb.dataIndex] || ''
              : it[lb.dataIndex] || ''
      });
      return lb;
    });
    return arr;
  });

  const multiDataSet = [{ columns: eColumns, data: eData }];

  showLog({ data, eColumns, eData });

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
                title="รายรับอื่นๆ"
                subtitle="รายงาน - บัญชี - รายรับ"
                activeStep={0}
                isRange={values.isRange}
                disableAllBranches
                extraComponent={
                  <div>
                    <Button
                      onClick={_onUpdate}
                      disabled={loading}
                      type="primary"
                      icon={<Check />}
                      loading={loading}
                      size="middle"
                      style={{ width: 130, marginRight: 10 }}
                    >
                      {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                    </Button>
                    <ExcelExport
                      dataSet={multiDataSet}
                      buttonText="Export ข้อมูล"
                      sheetName="รายรับอื่นๆ"
                      fileName="income_others"
                      // labelValue={labelValue}
                      disabled={data.length === 0}
                      style={{ width: 130 }}
                    />
                  </div>
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
        summary={pageData => <TableSummary pageData={pageData} dataLength={data.length} startAt={3} />}
      />
    </Container>
  );
};
