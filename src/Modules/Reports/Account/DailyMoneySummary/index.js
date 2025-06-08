import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
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
import { TableSummary } from 'api/Table';
import { isMobile } from 'react-device-detect';
import ExcelExport from 'Modules/Utils/Excels/ExcelExport';
import { dateToThai, distinctArr } from 'functions';

const initSnap = {
  total_cash: null,
  executive_cash_deposit: null,
  executive_cash_deposit_array: [],
  total_chompoo: null,
  total: null,
  total_transfer: null
};

const initRange = [moment().subtract(7, 'day').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];

const DailyMoneySummary = () => {
  // Extract user info from redux state
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const { executives } = useSelector(state => state.data);

  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useMergeState(initSnap);

  // Store search parameters in a ref to avoid unnecessary re-renders
  const searchValues = useRef({
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
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
      const queries = { ...searchValues.current };
      const fetchedData = await formatIncomeSummary(queries);
      setData(fetchedData);
      showLog({ fetchedData });

      // Calculate totals from the fetched data
      const total_cash = fetchedData.reduce((sum, item) => sum + Numb(item?.total_cash || 0), 0);
      const net_total = fetchedData.reduce((sum, item) => sum + Numb(item?.netTotal || 0), 0);
      const executive_cash_deposit = fetchedData.reduce(
        (sum, item) => sum + Numb(item?.executive_cash_deposit || 0),
        0
      );
      const total_chompoo = fetchedData.reduce((sum, item) => sum + Numb(item?.send_money_chompoo || 0), 0);
      const total_transfer = fetchedData.reduce((sum, item) => sum + Numb(item?.total_transfer || 0), 0);

      let exec_array = [];
      fetchedData.forEach(it => {
        // Safely merge executiveCashDeposit array if present
        exec_array = exec_array.concat(it.executiveCashDeposit || []);
      });
      exec_array = exec_array.filter(l => !l.deleted);
      exec_array = distinctArr(exec_array, ['executiveId'], ['total']);
      const executive_cash_deposit_array = exec_array.map(it => {
        // Fallback to empty object if no matching executive found
        const exec = executives[it.executiveId] || {};
        return {
          item: `ส่งเงินสด คุณ${exec.firstName || ''} ${exec.lastName || ''}`,
          value: it.total
        };
      });

      showLog({ executive_cash_deposit_array, exec_array });

      setSummary({
        total_cash,
        executive_cash_deposit,
        executive_cash_deposit_array,
        total_chompoo,
        total: total_cash + executive_cash_deposit + total_chompoo,
        total_transfer
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
        const value =
          column.dataIndex === 'date'
            ? moment(item[column.dataIndex], 'YYYY-MM-D').add(543, 'year').locale('th').format('D MMM YY')
            : item[column.dataIndex] || 0;
        return { value };
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

  const summaryData =
    summary.executive_cash_deposit_array.length === 0
      ? [
          { item: 'ส่งเงินสดประจำวัน', value: summary.total_cash },
          { item: 'ส่งเงินพี่ชมพู่', value: summary.total_chompoo }
        ].concat([
          // { item: 'ส่งเงินสดผู้บริหาร', value: summary.executive_cash_deposit },
          { item: 'รวมส่งเงินสด', value: summary.total, text: 'primary' },
          { item: 'สรุปเงินโอน', value: summary.total_transfer }
        ])
      : [{ item: 'ส่งเงินสดประจำวัน', value: summary.total_cash }].concat(summary.executive_cash_deposit_array).concat([
          { item: 'ส่งเงินพี่ชมพู่', value: summary.total_chompoo },
          { item: 'รวมส่งเงินสด', value: summary.total, text: 'primary' },
          { item: 'สรุปเงินโอน', value: summary.total_transfer }
        ]);

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          isRange: true,
          date: initRange
        }}
        layout="vertical"
        size="small"
        onValuesChange={handleValuesChange}
      >
        <div className="px-3 bg-white border-bottom">
          <BranchDateHeader
            title="สรุปส่งเงินประจำวัน"
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
                  sheetName="สรุปส่งเงินประจำวัน"
                  fileName={`daily-money-summary-${Date.now()}`}
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
          <TableSummary pageData={pageData} dataLength={data.length} startAt={0} sumKeys={Object.keys(mSnap)} />
        )}
      />

      {data.length > 0 && (
        <PageSummary
          title={`สรุปเงิน ${getBranchName(
            searchValues.current.branchCode
          )} วันที่ ${dateToThai(searchValues.current.date[0])} - ${dateToThai(searchValues.current.date[1])}`}
          data={summaryData}
        />
      )}
    </Container>
  );
};

export default DailyMoneySummary;
