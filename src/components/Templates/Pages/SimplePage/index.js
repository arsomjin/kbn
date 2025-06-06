import React from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useHistory } from 'react-router';
import { PlusOutlined } from '@ant-design/icons';
import BranchDateHeader from 'components/branch-date-header';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CommonSteps } from 'data/Constant';
import { showWarn } from 'functions';
import Footer from 'components/Footer';
import { renderInput } from './api';

export default () => {
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();

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
          date: moment(),
          vehicleRegNumber: null,
          gasCost: null,
          origin: null,
          destination: null,
          meterStart: null,
          meterEnd: null
        }}
        layout="vertical"
        size="small"
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white border-bottom">
                {/* <HiddenItem name="saleId" /> */}
                <BranchDateHeader
                  title="Title"
                  subtitle="Sub title"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={1}
                />
              </div>
              {renderInput()}
              <Footer
                onConfirm={() => _onPreConfirm(values)}
                onCancel={() => form.resetFields()}
                cancelText="ล้างข้อมูล"
                cancelPopConfirmText="ล้าง?"
                okPopConfirmText="ยืนยัน?"
                okIcon={<PlusOutlined />}
              />
            </>
          );
        }}
      </Form>
    </Container>
  );
};
