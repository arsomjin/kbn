import React, { useRef, useState } from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, formatIncomeSummary } from './api';
import EditableRowTable from 'components/EditableRowTable';
import { showLog, showWarn, Numb } from 'functions';
import BranchMonthHeader from 'components/branch-month-header';
import { getSearchData } from 'firebase/api';
import { useMergeState } from 'api/CustomHooks';
import { h, PageSummary } from 'api';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';

const initSnap = {
  total_aso: null,
  total_company: null,
  total_k_benz: null,
  total: null
};

export default () => {
  const { user } = useSelector(state => state.auth);
  const { banks, employees, customers } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cState, setCState] = useMergeState(initSnap);

  const searchValues = useRef({
    branchCode: user?.branch || '0450',
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
        ...searchValues.current,
        hasBankTransfer: true
      };
      let sData = await getSearchData('sections/account/incomes', queries);

      let fData = await formatIncomeSummary(
        sData.filter(l => !l.deleted),
        banks,
        employees,
        customers
      );
      showLog({ sData, fData });
      setData(fData);
      setCState({
        total_aso: fData.reduce((sum, elem) => sum + Numb(elem?.aso_acc || 0), 0),
        total_company: fData.reduce((sum, elem) => sum + Numb(elem?.company_acc || 0), 0),
        total_k_benz: fData.reduce((sum, elem) => sum + Numb(elem?.k_benz_acc || 0), 0),
        total: fData.reduce((sum, elem) => sum + Numb(elem?.amount || 0), 0)
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
          branchCode: user?.branch || '0450',
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
                title="เงินฝากธนาคาร"
                subtitle="รายงาน - บัญชี - รายรับ"
                activeStep={0}
                isRange={values.isRange}
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
