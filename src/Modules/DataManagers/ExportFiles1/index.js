import React, { useState } from 'react';
import { Form } from 'antd';
import { CardFooter, Container } from 'shards-react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { showWarn } from 'functions';
import { Button } from 'elements';

import { renderInput } from './api';
import PageTitle from 'components/common/PageTitle';
import ExcelExport from 'Modules/Utils/Excels/ExcelExport';
import { isMobile } from 'react-device-detect';

const dataSet1 = [
  {
    name: 'Johson',
    amount: 30000,
    sex: 'M',
    is_married: true
  },
  {
    name: 'Monika',
    amount: 355000,
    sex: 'F',
    is_married: false
  },
  {
    name: 'John',
    amount: 250000,
    sex: 'M',
    is_married: false
  },
  {
    name: 'Josef',
    amount: 450500,
    sex: 'M',
    is_married: true
  }
];

const labelValue = [
  {
    label: 'Name',
    value: 'name'
  },
  {
    label: 'Wallet Money',
    value: 'amount'
  },
  {
    label: 'Gender',
    value: 'sex'
  },
  {
    label: 'Marital Status',
    value: col => (col.is_married ? 'Married' : 'Single')
  }
];

export default () => {
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [dataSet, setDataSet] = useState([]);

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
                <PageTitle sm="4" title="Title" subtitle="Subtitle" className="text-sm-left" />
              </div>
              {renderInput()}
              <CardFooter className={`d-flex p-2 border-top ${isMobile ? 'flex-column' : ''}`}>
                <Button
                  onClick={() => form.resetFields()}
                  className="m-1"
                  {...(!isMobile && { style: { width: 132 } })}
                  size="middle"
                >
                  {'ล้างหน้าจอ'}
                </Button>
                <Button className="m-1" {...(!isMobile && { style: { width: 140 } })} type="primary" size="middle">
                  {'ดูข้อมูล'}
                </Button>
                <ExcelExport
                  dataSet={dataSet1}
                  buttonText="Export ข้อมูล"
                  sheetName="Employees"
                  fileName="test_file"
                  labelValue={labelValue}
                  disabled={dataSet1.length === 0}
                />
              </CardFooter>
            </>
          );
        }}
      </Form>
    </Container>
  );
};
