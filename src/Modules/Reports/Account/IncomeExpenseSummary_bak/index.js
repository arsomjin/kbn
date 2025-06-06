import React, { useEffect, useRef, useState } from 'react';
import PageTitle from 'components/common/PageTitle';
import { Form, Tabs } from 'antd';
import { ReportSteps } from 'data/Constant';
import { Stepper } from 'elements';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'shards-react';
import moment from 'moment';
import { showLog, firstKey, showWarn } from 'functions';
import { getIncome, getIncome_Parts } from './api';
import Income from './components/Income';
import AccountReportHeader from '../components/account-report-header';
import Expense from './components/Expense';
import { useMergeState } from 'api/CustomHooks';
import { useLocation } from 'react-router';
import HiddenItem from 'components/HiddenItem';
import { Button } from 'elements';
import { Check } from '@material-ui/icons';
const { TabPane } = Tabs;

export default () => {
  let location = useLocation();
  const params = location.state?.params;
  //  showLog({ params });

  const { user } = useSelector(state => state.auth);
  const { users } = useSelector(state => state.data);
  const activeStep = 0;

  const [updating, setUpdating] = useState(false);
  const [cState, setCState] = useMergeState({
    changeDeposit: 0,
    bankTransfer: [],
    afterDailyClosed: [],
    afterAccountClosed: [],
    duringDayMoney: [],
    bankDeposit: []
  });

  const [form] = Form.useForm();

  const searchValues = useRef({
    branchCode: params && params?.branchCode ? params.branchCode : user?.branch || '0450',
    date: params && params?.date ? moment(params.date, 'YYYY-MM-DD') : moment(),
    excludeParts: 1
  });

  useEffect(() => {
    _onUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = async val => {
    //  showLog({ val });
    if (['branchCode', 'excludeParts', 'date'].includes(firstKey(val))) {
      searchValues.current = { ...searchValues.current, ...val };
    }
  };

  const _onUpdate = async () => {
    try {
      //  showLog({ val });
      setUpdating(true);
      const { branchCode, date, excludeParts } = searchValues.current;
      const dailyIncome =
        excludeParts !== 3
          ? await getIncome(branchCode, date, excludeParts)
          : await getIncome_Parts(branchCode, date, excludeParts);
      const {
        incomes,
        expenses,
        dailyChangeDeposit,
        bankTransfer,
        duringDayMoney,
        afterDailyClosed,
        afterAccountClosed,
        bankDeposit
      } = dailyIncome;
      showLog({ dailyIncome, incomes, expenses, bankTransfer, bankDeposit });
      form.setFieldsValue({ incomeItems: incomes, expenseItems: expenses });
      setCState({
        changeDeposit: dailyChangeDeposit,
        bankTransfer,
        duringDayMoney,
        afterDailyClosed,
        afterAccountClosed,
        bankDeposit
      });
      setUpdating(false);
    } catch (e) {
      showWarn(e);
      setUpdating(false);
    }
  };

  useEffect(() => {
    // showLog('Init_Income_Expense_Report');
    // if (params && params?.branchCode) {
    onChange({
      branchCode: params && params?.branchCode ? params.branchCode : user?.branch || '0450',
      date: params && params?.date ? moment(params.date, 'YYYY-MM-DD') : moment()
    });
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle sm="4" title="สรุปรายรับ-รายจ่าย" subtitle="บัญชี" className="text-sm-left" />
        <Col>
          <Stepper
            className="bg-light"
            steps={ReportSteps}
            activeStep={activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>
      <Form
        form={form}
        initialValues={{
          branchCode: params && params?.branchCode ? params.branchCode : user?.branch || '0450',
          date: params && params?.date ? moment(params.date, 'YYYY-MM-DD') : moment(),
          excludeParts: 1,
          incomeItems: [],
          expenseItems: []
        }}
        size="small"
        layout="vertical"
        onValuesChange={val => onChange(val)}
      >
        {values => {
          const { incomeItems, expenseItems } = values;
          // showLog({ incomeItems, expenseItems });

          return (
            <div>
              {values.branchCode !== '0450' && <HiddenItem name="excludeParts" />}
              <AccountReportHeader
                values={values}
                disableAllBranches
                onlyUserBranch={user.branch}
                extraComponent={
                  <Button onClick={_onUpdate} disabled={updating} type="primary" icon={<Check />} loading={updating}>
                    {updating ? 'กำลังคำนวณ...' : 'ตกลง'}
                  </Button>
                }
                disabled={updating}
              />

              <Tabs type="card">
                <TabPane tab="รายรับ" key="1">
                  <Income
                    items={values.incomeItems}
                    expenses={values.expenseItems}
                    updating={updating}
                    bankTransfer={cState.bankTransfer}
                    bankDeposit={cState.bankDeposit}
                    duringDayMoney={cState.duringDayMoney}
                    changeDeposit={cState.changeDeposit}
                    afterDailyClosed={cState.afterDailyClosed}
                    afterAccountClosed={cState.afterAccountClosed}
                    searchValues={searchValues.current}
                  />
                </TabPane>
                <TabPane tab="รายจ่ายเงินทอน" key="2">
                  <Expense
                    items={values.expenseItems}
                    updating={updating}
                    changeDeposit={cState.changeDeposit}
                    searchValues={searchValues.current}
                  />
                </TabPane>
              </Tabs>
            </div>
          );
        }}
      </Form>
    </Container>
  );
};
