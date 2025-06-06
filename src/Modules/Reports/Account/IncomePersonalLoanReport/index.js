import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, eColumns, formatIncomeSummary, mSnap } from './helper';
import EditableRowTable from 'components/EditableRowTable';
import { showLog, showWarn, Numb } from 'functions';
import BranchDateHeader from 'components/branch-date-header';
import { useMergeState } from 'api/CustomHooks';
import { h, PageSummary } from 'api';
import { getBranchName } from 'Modules/Utils';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { TableSummary } from 'components/Table/helper';
import { isMobile } from 'react-device-detect';
import ExcelExport from 'Modules/Utils/Excels/ExcelExport';
import { dateToThai, distinctArr } from 'functions';
import { getCollection } from 'firebase/api';
import { getSearchData } from 'firebase/api';
import { IncomeDailyCategories } from 'data/Constant';

const initSnap = {
  total_part: null,
  total_service: null,
  total_vehicle: null,
  grand_total: null
};

const initRange = [moment().subtract(7, 'day').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];

const IncomePersonalLoanReport = () => {
  // Extract user info from redux state
  const { user } = useSelector(state => state.auth);
  const { banks, branches } = useSelector(state => state.data);

  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useMergeState(initSnap);

  // Store search parameters in a ref to avoid unnecessary re-renders
  const searchValues = useRef({
    branchCode: user?.branch || '0450',
    date: initRange
  });

  /**
   * Handle changes in form values.
   */
  const handleValuesChange = useCallback(
    changedValues => {
      searchValues.current = { ...searchValues.current, ...changedValues };
      setData([]);
      setSummary(initSnap);
    },
    [setSummary]
  );

  /**
   * Fetches and computes summary data based on current search values.
   */
  const handleUpdate = useCallback(async () => {
    try {
      setLoading(true);
      const { branchCode, date } = searchValues.current;
      let queries = {
        branchCode,
        startDate: date[0],
        endDate: date[1]
      };
      const fetchedData = await getSearchData('sections/account/incomePersonalLoan', queries, ['incomeDate'], {
        date: 'incomeDate'
      });
      setData(fetchedData);
      showLog({ fetchedData });

      // Calculate totals from the fetched data
      const total_vehicle = fetchedData
        .filter(l => l.incomeSubCategory === 'vehicles')
        .reduce((sum, item) => sum + Numb(item?.amtReceived || 0), 0);

      const total_part = fetchedData
        .filter(l => l.incomeSubCategory === 'parts')
        .reduce((sum, item) => sum + Numb(item?.amtReceived || 0), 0);

      const total_service = fetchedData
        .filter(l => l.incomeSubCategory === 'service')
        .reduce((sum, item) => sum + Numb(item?.amtReceived || 0), 0);

      let grand_total = total_vehicle + total_part + total_service;

      setSummary({
        total_part,
        total_service,
        total_vehicle,
        grand_total
      });
    } catch (error) {
      showWarn(error);
    } finally {
      setLoading(false);
    }
  }, [setSummary]);

  /**
   * Prepare export data for ExcelExport.
   */
  const exportData = useMemo(() => {
    const formattedData = data.map(item =>
      eColumns.map(column => {
        const rawValue = item?.[column.dataIndex];

        if (column.dataIndex === 'incomeDate' || column.dataIndex === 'payDate') {
          return {
            value: rawValue ? moment(rawValue, 'YYYY-MM-DD').add(543, 'year').locale('th').format('D MMM YY') : ''
          };
        }

        if (column.dataIndex === 'customer') {
          return {
            value: `${item?.prefix || ''}${item?.firstName || ''} ${item?.lastName || ''}`.trim()
          };
        }

        if (column.dataIndex === 'item') {
          return {
            value: Array.isArray(rawValue) ? rawValue.join(', ') : rawValue || ''
          };
        }

        if (column.dataIndex === 'incomeSubCategory') {
          return {
            value: IncomeDailyCategories[rawValue] || rawValue || ''
          };
        }

        if (column.dataIndex === 'branchCode') {
          return {
            value: rawValue && branches[rawValue] ? branches[rawValue].branchName : rawValue || ''
          };
        }

        if (column.dataIndex === 'selfBankId') {
          return {
            value: banks[rawValue]
              ? `${banks[rawValue].bankName} - ${banks[rawValue].accNo} - ${banks[rawValue].name}`
              : ''
          };
        }

        if (typeof rawValue === 'object' && rawValue !== null) {
          return { value: '' }; // Or safely stringify if needed
        }

        return { value: rawValue ?? '' };
      })
    );

    return [
      {
        columns: [{ title: 'วันที่' }, { title: 'สาขา' }, { title: 'Export' }],
        data: [
          [
            {
              value: `${dateToThai(searchValues.current.date[0])} - ${dateToThai(searchValues.current.date[1])}`
            },
            {
              value: getBranchName(searchValues.current.branchCode, true)
            },
            {
              value: `${dateToThai(moment().format('YYYY-MM-DD'))} เวลา ${moment().format('HH:mm')}`
            }
          ]
        ]
      },
      {
        ySteps: 1,
        columns: eColumns,
        data: formattedData
      }
    ];
  }, [data]);

  const summaryData = [
    { item: 'อะไหล่', value: summary.total_part },
    { item: 'บริการ', value: summary.total_service },
    { item: 'รถและอุปกรณ์', value: summary.total_vehicle },
    { item: 'รวมรับเงินทั้งสิ้น', value: summary.grand_total, text: 'primary' }
  ];

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || '0450',
          isRange: true,
          date: initRange
        }}
        layout="vertical"
        size="small"
        onValuesChange={handleValuesChange}
      >
        <div className="px-3 bg-white border-bottom">
          <BranchDateHeader
            title="รายรับ - สินเชื่อส่วนบุคคล"
            subtitle="รายงาน - บัญชี - รายรับ"
            activeStep={0}
            isRange
            onlyUserBranch={user.branch}
            extraComponent={
              <div className={!isMobile ? 'mt-4' : undefined}>
                <Button
                  onClick={handleUpdate}
                  disabled={loading}
                  type="primary"
                  icon={<Check />}
                  loading={loading}
                  size="middle"
                  style={{ width: 130 }}
                  className="mr-2"
                >
                  {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                </Button>
                <ExcelExport
                  dataSet={exportData}
                  buttonText="Export ข้อมูล"
                  sheetName="รายรับ-สินเชื่อส่วนบุคคล"
                  fileName={`income-personal-loan-${Date.now()}`}
                  disabled={data.length === 0}
                  style={{ width: 130 }}
                />
              </div>
            }
            disabled={loading}
          />
        </div>
      </Form>

      {loading && (
        <div className="d-flex align-items-center justify-content-center mt-3">
          <span className="text-primary">กำลังคำนวณ...</span>
        </div>
      )}

      <EditableRowTable
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 100, hideOnSinglePage: true }}
        scroll={{ y: h(80) }}
        summary={pageData => (
          <TableSummary
            pageData={pageData}
            dataLength={data.length}
            startAt={5}
            sumKeys={['totalLoan', 'payDate', 'amtReceived']}
            skipColumns={['payDate']}
          />
        )}
      />

      {data.length > 0 && (
        <PageSummary
          title={`สรุปรับเงิน สินเชื่อส่วนบุคคล วันที่ ${dateToThai(searchValues.current.date[0])} - ${dateToThai(
            searchValues.current.date[1]
          )}`}
          data={summaryData}
        />
      )}
    </Container>
  );
};

export default IncomePersonalLoanReport;
