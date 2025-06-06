import React, { useRef, useState } from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, eColumns, formatIncomeSummary } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { showLog, showWarn } from 'functions';
import { h } from 'api';
import { daysInMonth } from 'functions';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { TableSummary } from 'api/Table';
import BranchDateHeader from 'components/branch-date-header';
import { isMobile } from 'react-device-detect';
import ExcelExport from 'Modules/Utils/Excels/ExcelExport';
import { dateToThai } from 'functions';

const initRange = [moment().subtract(7, 'day').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];

export default () => {
  const { branches } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchValues = useRef({
    // branchCode: user?.branch || '0450',
    date: initRange
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

  const multiDataSet = [
    {
      columns: [{ title: 'วันที่' }, { title: 'Export' }],
      data: [
        [
          {
            value: `${dateToThai(searchValues.current.date[0])} - ${dateToThai(searchValues.current.date[1])}`
          },
          {
            value: `${dateToThai(moment().format('YYYY-MM-DD'))} เวลา ${moment().format('HH:mm')}`
          }
        ]
      ]
    },
    { ySteps: 1, columns: eColumns, data: eData }
  ];

  showLog({ data, eColumns, eData });

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          // branchCode: user?.branch || '0450',
          isRange: true,
          date: initRange
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <div className="px-3 bg-white border-bottom">
              {/* <HiddenItem name="incomeId" /> */}
              <BranchDateHeader
                title="รายรับขายอะไหล่รวม"
                subtitle="รายงาน - บัญชี - รายรับ"
                activeStep={0}
                isRange={values.isRange}
                disableAllBranches
                extraComponent={
                  <div {...(!isMobile && { className: 'mt-4' })}>
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
                      sheetName="รายรับขายอะไหล่รวม"
                      fileName="income_parts"
                      // labelValue={labelValue}
                      disabled={data.length === 0}
                      style={{ width: 130 }}
                    />
                  </div>
                }
                disabled={loading}
                onlyDate
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
            startAt={0}
            sumKeys={['0450', '0454', '0455', '0452', '0453', '0456', '0451', 'total']}
          />
        )}
      />
    </Container>
  );
};
