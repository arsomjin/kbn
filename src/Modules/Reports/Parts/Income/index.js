import { Form } from 'antd';
import { useGeographicData } from 'hooks/useGeographicData';
import { ReportSteps } from 'data/Constant';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from 'shards-react';
import BranchDateHeader from 'components/branch-date-header';
import { firstKey } from 'functions';
import { getPartsIncome } from './api';
import { useMergeState } from 'api/CustomHooks';
import { showWarn } from 'functions';
import Income from './components/Income';

export default () => {
  let location = useLocation();
  const params = location.state?.params;
  //  showLog({ params });
  const activeStep = 0;
  const [updating, setUpdating] = useState(false);
  const [cState, setCState] = useMergeState({
    changeDeposit: 0,
    bankTransfer: [],
    dailyParts: []
  });

  const [form] = Form.useForm();

  const _onValuesChange = useCallback(
    async val => {
      try {
        //  showLog({ val });
        if (['branchCode', 'date'].includes(firstKey(val))) {
          // Update data.
          setUpdating(true);
          const values = form.getFieldsValue();
          const { branchCode, date } = values;
          const dailyIncome = await getPartsIncome(branchCode, date);
          const { incomes, partChangeDeposit, bankTransfer, dailyParts } = dailyIncome;
          form.setFieldsValue({ incomeItems: incomes });
          setCState({
            changeDeposit: partChangeDeposit,
            bankTransfer,
            dailyParts
          });
        }
        setUpdating(false);
      } catch (e) {
        showWarn(e);
        setUpdating(false);
      }
    },
    [form, setCState]
  );

  useEffect(() => {
    // showLog('Init_Income_Expense_Report');
    // if (params && params?.branchCode) {
    _onValuesChange({
      branchCode: params && params?.branchCode ? params.branchCode : '0450',
      date: params && params?.date ? dayjs(params.date, 'YYYY-MM-DD') : dayjs()
    });
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: params && params?.branchCode ? params.branchCode : '0450',
          date: params && params?.date ? dayjs(params.date, 'YYYY-MM-DD') : dayjs(),
          incomeItems: [],
          expenseItems: []
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white border-bottom">
                {/* <HiddenItem name="saleId" /> */}
                <BranchDateHeader
                  title="สรุปรายรับ-อะไหล่"
                  subtitle="อะไหล่"
                  disableAllBranches
                  steps={ReportSteps}
                  activeStep={0}
                />
              </div>
              <Income
                items={values.incomeItems}
                expenses={values.expenseItems}
                updating={updating}
                bankTransfer={cState.bankTransfer}
                changeDeposit={cState.changeDeposit}
                afterDailyClosed={cState.afterDailyClosed}
                afterAccountClosed={cState.afterAccountClosed}
              />
            </>
          );
        }}
      </Form>
    </Container>
  );
};
