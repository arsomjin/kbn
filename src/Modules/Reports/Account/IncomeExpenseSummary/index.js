import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import moment from 'moment';
import { Form, Tabs } from 'antd';
import { Container, Row, Col } from 'shards-react';
import { Check } from '@material-ui/icons';

import PageTitle from 'components/common/PageTitle';
import { ReportSteps } from 'data/Constant';
import { Stepper } from 'elements';
import { firstKey, showWarn } from 'functions';
import { getIncome, getIncome_Parts } from './api';
import Income from './components/Income';
import Expense from './components/Expense';
import AccountReportHeader from '../components/account-report-header';
import HiddenItem from 'components/HiddenItem';
import { Button } from 'elements';
import { useMergeState } from 'api/CustomHooks';
import { isMobile } from 'react-device-detect';

const { TabPane } = Tabs;

const IncomeExpenseReport = () => {
  const location = useLocation();
  const params = location.state?.params;

  const { user } = useSelector(state => state.auth);
  // Note: "users" is imported from redux but not used in this file.
  const activeStep = 0;

  const [updating, setUpdating] = useState(false);
  const [cState, setCState] = useMergeState({
    changeDeposit: 0,
    bankTransfer: [],
    personalLoan: [],
    afterDailyClosed: [],
    afterAccountClosed: [],
    duringDayMoney: [],
    bankDeposit: [],
    executiveCashDeposit: []
  });

  const [form] = Form.useForm();

  // Initialize search values (using params if available, otherwise fallback)
  const searchValues = useRef({
    branchCode: params?.branchCode || user?.branch || '0450',
    date: params?.date ? moment(params.date, 'YYYY-MM-DD') : moment(),
    excludeParts: 1
  });

  /**
   * Updates search values when a change occurs.
   *
   * @param {object} val - The updated value(s)
   */
  const handleSearchChange = val => {
    if (['branchCode', 'excludeParts', 'date'].includes(firstKey(val))) {
      searchValues.current = { ...searchValues.current, ...val };
    }
  };

  /**
   * Fetches income and expense data based on the current search values.
   */
  const handleUpdate = useCallback(async () => {
    try {
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
        personalLoan,
        duringDayMoney,
        afterDailyClosed,
        afterAccountClosed,
        bankDeposit,
        executiveCashDeposit
      } = dailyIncome;

      // showLog({ dailyIncome, incomes, expenses, bankTransfer, bankDeposit, executiveCashDeposit });

      form.setFieldsValue({ incomeItems: incomes, expenseItems: expenses });
      setCState({
        changeDeposit: dailyChangeDeposit,
        bankTransfer,
        personalLoan,
        duringDayMoney,
        afterDailyClosed,
        afterAccountClosed,
        bankDeposit,
        executiveCashDeposit
      });
    } catch (error) {
      showWarn(error);
    } finally {
      setUpdating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On mount (or when params/user change), update search values and fetch data
  useEffect(() => {
    const initialValues = {
      branchCode: params?.branchCode || user?.branch || '0450',
      date: params?.date ? moment(params.date, 'YYYY-MM-DD') : moment()
    };
    handleSearchChange(initialValues);
    handleUpdate();
  }, [handleUpdate, params, user]);

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle sm="4" title="สรุปรายรับ-รายจ่าย" subtitle="บัญชี" className="text-sm-left" />
        <Col>
          <Stepper className="bg-light" steps={ReportSteps} activeStep={activeStep} alternativeLabel={false} />
        </Col>
      </Row>
      <Form
        form={form}
        initialValues={{
          branchCode: params?.branchCode || user?.branch || '0450',
          date: params?.date ? moment(params.date, 'YYYY-MM-DD') : moment(),
          excludeParts: 1,
          incomeItems: [],
          expenseItems: []
        }}
        size="small"
        layout="vertical"
        onValuesChange={handleSearchChange}
      >
        {values => {
          const { incomeItems, expenseItems, branchCode } = values;
          return (
            <div>
              {branchCode !== '0450' && <HiddenItem name="excludeParts" />}
              <AccountReportHeader
                values={values}
                disableAllBranches
                onlyUserBranch={user.branch}
                extraComponent={
                  <Button
                    onClick={handleUpdate}
                    disabled={updating}
                    type="primary"
                    icon={<Check style={{ fontSize: 16, marginRight: 6 }} />}
                    loading={updating}
                    style={{ marginBottom: isMobile ? 20 : 0 }}
                  >
                    {updating ? 'กำลังคำนวณ...' : 'ดูรายงาน'}
                  </Button>
                }
                disabled={updating}
              />
              <Tabs type="card">
                <TabPane tab="รายรับ" key="1">
                  <Income
                    items={incomeItems}
                    expenses={expenseItems}
                    updating={updating}
                    bankTransfer={cState.bankTransfer}
                    bankDeposit={cState.bankDeposit}
                    personalLoan={cState.personalLoan}
                    executiveCashDeposit={cState.executiveCashDeposit}
                    duringDayMoney={cState.duringDayMoney}
                    changeDeposit={cState.changeDeposit}
                    afterDailyClosed={cState.afterDailyClosed}
                    afterAccountClosed={cState.afterAccountClosed}
                    searchValues={searchValues.current}
                  />
                </TabPane>
                <TabPane tab="รายจ่ายเงินทอน" key="2">
                  <Expense
                    items={expenseItems}
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

export default IncomeExpenseReport;
