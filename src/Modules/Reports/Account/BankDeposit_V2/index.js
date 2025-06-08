import React, { useRef, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, formatBankDeposit, formatIncomeSummary, getEColumns } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { showLog, showWarn, Numb, sortArr } from 'functions';
import { getSearchData } from 'firebase/api';
import { useMergeState } from 'api/CustomHooks';
import { h, PageSummary } from 'api';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import BranchDateSpecificHeader from 'components/branch-date-specific-header';
import ExcelExport from 'Modules/Utils/Excels/ExcelExport';
import { dateToThai } from 'functions';

const initSnap = {
  total_aso: null,
  total_company: null,
  total_k_benz: null,
  total: null
};

const defaultRange = [moment().startOf('W').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];

export default () => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const { banks, employees, customers, branches } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cState, setCState] = useMergeState(initSnap);
  const [range, setRange] = useState(defaultRange);

  const searchValues = useRef({
    // branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    startDate: range[0],
    endDate: range[1]
    // month: moment().format('YYYY-MM'),
  });

  const _onValuesChange = val => {
    searchValues.current = { ...searchValues.current, ...val };
    setData([]);
    setCState(initSnap);
  };

  const _onUpdate = async () => {
    try {
      showLog({ dateRange: range });
      setLoading(true);
      let queries = {
        ...searchValues.current,
        startDate: range[0],
        endDate: range[1],
        hasBankTransfer: true
      };
      showLog({ queries });
      let sData = await getSearchData('sections/account/incomes', queries);

      let fData = await formatIncomeSummary(
        sData.filter(l => !l.deleted),
        banks,
        employees,
        customers
      );

      let bankDepositData = await getSearchData(
        'sections/account/bankDeposit',
        {
          startDate: range[0],
          endDate: range[1]
        },
        ['depositDate'],
        { date: 'depositDate' }
      );

      let bData = await formatBankDeposit(
        bankDepositData.filter(l => !l.deleted),
        banks,
        employees,
        customers
      );
      let sortData = sortArr([...fData, ...bData], 'date');
      let allData = sortData.map((l, id) => ({
        ...l,
        id,
        key: id
      }));
      showLog({ sData, fData, bData, allData });
      setData(allData);
      setCState({
        total_aso: allData.reduce((sum, elem) => sum + Numb(elem?.aso_acc || 0), 0),
        total_company: allData.reduce((sum, elem) => sum + Numb(elem?.company_acc || 0), 0),
        total_k_benz: allData.reduce((sum, elem) => sum + Numb(elem?.k_benz_acc || 0), 0),
        total: allData.reduce((sum, elem) => sum + Numb(elem?.amount || 0), 0)
      });
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const _onStartDateChange = val => {
    const start = moment(val).format('YYYY-MM-DD');
    const nRange = [start, range[1]];
    setRange(nRange);
    showLog({ startRange: nRange });
  };

  const _onEndDateChange = val => {
    const end = moment(val).format('YYYY-MM-DD');
    const nRange = [range[0], end];
    setRange(nRange);
    showLog({ endRange: nRange });
  };

  let eColumns = getEColumns(columns);

  const eData = data.map(it => {
    let arr = [];
    eColumns.map(lb => {
      arr.push({
        value:
          lb.dataIndex === 'date'
            ? moment(it[lb.dataIndex], 'YYYY-MM-D').add(543, 'year').locale('th').format('D MMM YY')
            : lb.dataIndex === 'selfBank'
              ? it[lb.dataIndex] && banks[it[lb.dataIndex]]
                ? `${banks[it[lb.dataIndex]].name} / ${
                    banks[it[lb.dataIndex]].bankName
                  } / ${banks[it[lb.dataIndex]].accNo}`
                : ''
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
            value: `${dateToThai(range[0])} - ${dateToThai(range[1])}`
          },
          {
            value: `${dateToThai(moment().format('YYYY-MM-DD'))} เวลา ${moment().format('HH:mm')}`
          }
        ]
      ]
    },
    { ySteps: 1, columns: eColumns, data: eData }
  ];

  showLog({ eColumns, eData });

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          isRange: false,
          month: moment(),
          monthRange: [moment().subtract(1, 'month'), moment()]
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          showLog({ values });
          return (
            <div className="px-3 pb-2 bg-white border-bottom">
              {/* <HiddenItem name="incomeId" /> */}
              <BranchDateSpecificHeader
                title="เงินฝากธนาคาร"
                subtitle="รายงาน - บัญชี - รายรับ"
                activeStep={0}
                isRange={values.isRange}
                defaultRange={defaultRange}
                onStartDateChange={_onStartDateChange}
                onEndDateChange={_onEndDateChange}
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
                      sheetName="เงินฝากธนาคาร"
                      fileName="bank_deposit"
                      // labelValue={labelValue}
                      disabled={data.length === 0}
                      style={{ width: 130 }}
                    />
                  </div>
                }
                disabled={loading}
                noBranch
                noRange
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
        pagination={{ pageSize: 50 }}
        scroll={{ y: h(70) }}
      />
      {data.length > 0 && (
        <PageSummary
          // title="สรุปเงินฝากธนาคาร"
          data={[
            { item: 'จำนวนเงินโอนเข้า บ/ช อาซ๊อ', value: cState.total_aso },
            {
              item: 'จำนวนเงินโอนเข้า บ/ช บริษัท',
              value: cState.total_company
            },
            {
              item: 'จำนวนเงินโอนเข้า บ/ช คุณเบนซ์',
              value: cState.total_k_benz
            },
            { item: 'รวมจำนวนเงินโอน', value: cState.total }
          ]}
        />
      )}
    </Container>
  );
};
