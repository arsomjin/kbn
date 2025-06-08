import React, { useRef, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, formatIncomeSummary, mSnap } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { showWarn, Numb } from 'functions';
import BranchMonthHeader from 'components/branch-month-header';
import { useMergeState } from 'api/CustomHooks';
import { h, PageSummary } from 'api';
import { getBranchName } from 'Modules/Utils';
import { daysInMonth } from 'functions';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
import { TableSummary } from 'api/Table';

const initSnap = {
  total_cash: null,
  total_hia: null,
  total_k_benz: null,
  total_chompoo: null,
  total: null,
  total_transfer: null
};

export default () => {
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const { banks } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cState, setCState] = useMergeState(initSnap);

  const searchValues = useRef({
    branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
    month: moment().format('YYYY-MM')
  });

  const _onValuesChange = val => {
    searchValues.current = { ...searchValues.current, ...val };
    setData([]);
    setCState(initSnap);
  };

  const _onUpdate = async val => {
    try {
      //  showLog({ val });
      setLoading(true);
      let queries = {
        ...searchValues.current
      };
      // let sData = await getSearchData('sections/account/incomes', queries);

      let fData = await formatIncomeSummary(queries);
      setData(fData);
      let total_cash = fData.reduce((sum, elem) => sum + Numb(elem?.total_cash || 0), 0);
      let total_hia = fData.reduce((sum, elem) => sum + Numb(elem?.send_money_hia || 0), 0);
      let total_k_benz = fData.reduce((sum, elem) => sum + Numb(elem?.send_money_k_benz || 0), 0);
      let total_chompoo = fData.reduce((sum, elem) => sum + Numb(elem?.send_money_chompoo || 0), 0);
      setCState({
        total_cash,
        total_hia,
        total_k_benz,
        total_chompoo,
        total: total_cash + total_hia + total_k_benz + total_chompoo,
        total_transfer: fData.reduce((sum, elem) => sum + Numb(elem?.total_transfer || 0), 0)
      });
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
          //  showLog({ values });
          return (
            <div className="px-3 bg-white border-bottom">
              {/* <HiddenItem name="incomeId" /> */}
              <BranchMonthHeader
                title="สรุปส่งเงินประจำวัน"
                subtitle="รายงาน - บัญชี - รายรับ"
                activeStep={0}
                isRange={values.isRange}
                onlyUserBranch={user.branch}
                // disableAllBranches
                extraComponent={
                  <Button onClick={_onUpdate} disabled={loading} type="primary" icon={<Check />} loading={loading}>
                    {loading ? 'กำลังคำนวณ...' : 'ตกลง'}
                  </Button>
                }
                disabled={loading}
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
            sumKeys={Object.keys(mSnap).map(k => k)}
          />
        )}
      />
      {data.length > 0 && (
        <PageSummary
          title={`สรุปเงิน ${getBranchName(searchValues.current.branchCode)} ประจำเดือน ${moment(
            searchValues.current.month,
            'YYYY-MM'
          )
            .add(543, 'year')
            .locale('th')
            .format('MMMM YYYY')}`}
          data={[
            { item: 'ส่งเงินสดประจำวัน', value: cState.total_cash },
            { item: 'ส่งเงินเฮีย', value: cState.total_hia },
            { item: 'ส่งเงินคุณเบนซ์', value: cState.total_k_benz },
            { item: 'ส่งเงินพี่ชมพู่', value: cState.total_chompoo },
            { item: 'รวมส่งเงินสด', value: cState.total, text: 'primary' },
            { item: 'สรุปเงินโอน', value: cState.total_transfer }
          ]}
        />
      )}
    </Container>
  );
};
