import React from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useHistory } from 'react-router';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import { CommonSteps } from 'data/Constant';
import { showWarn } from 'functions';
import Footer from 'components/Footer';
import { renderInput } from './api';
import { uniq } from 'lodash';
import { ExtraPositions } from 'data/Constant';

export default () => {
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const { employees } = useSelector(state => state.data);
  const [form] = Form.useForm();

  let POSITIONS = uniq(
    Object.keys(employees)
      .map(k => employees[k].position)
      .filter(l => !!l)
  );

  POSITIONS = (POSITIONS || []).concat(ExtraPositions);

  const _onPreConfirm = async values => {
    try {
      let mValues = await form.validateFields();
      //  showLog({ values, mValues });
    } catch (e) {
      showWarn(e);
    }
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || '0450',
          date: undefined,
          employeeId: null,
          department: null,
          position: null,
          leaveType: null,
          reason: null,
          leaveDays: null,
          fromDate: undefined,
          toDate: undefined,
          recordedBy: null,
          approvedBy: null
        }}
        layout="vertical"
        size="small"
      >
        {values => {
          //  showLog({ values });
          return (
            <>
              <div className="px-3 bg-white border-bottom">
                {/* <HiddenItem name="saleId" /> */}
                <BranchDateHeader
                  title="ลางาน"
                  subtitle="บุคคล"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={1}
                />
              </div>
              {renderInput({ POSITIONS })}
              <Footer
                onConfirm={() => _onPreConfirm(values)}
                onCancel={() => form.resetFields()}
                cancelText="ล้างข้อมูล"
                cancelPopConfirmText="ล้าง?"
                okPopConfirmText="ยืนยัน?"
                alignRight
                className="mx-3 pt-4"
              />
            </>
          );
        }}
      </Form>
    </Container>
  );
};
