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
import ReactExport from 'react-data-export';

import { isMobile } from 'react-device-detect';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const multiDataSet = [
  {
    columns: ['Name', 'Salary', 'Sex'],
    data: [
      ['Johnson', 30000, 'Male'],
      ['Monika', 355000, 'Female'],
      ['Konstantina', 20000, 'Female'],
      ['John', 250000, 'Male'],
      ['Josef', 450500, 'Male']
    ]
  },
  {
    xSteps: 1, // Will start putting cell with 1 empty cell on left most
    ySteps: 5, //will put space of 5 rows,
    columns: ['Name', 'Department'],
    data: [
      ['Johnson', 'Finance'],
      ['Monika', 'IT'],
      ['Konstantina', 'IT Billing'],
      ['John', 'HR'],
      ['Josef', 'Testing']
    ]
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
                <ExcelFile>
                  <ExcelSheet dataSet={multiDataSet} name="Organization" />
                </ExcelFile>
              </CardFooter>
            </>
          );
        }}
      </Form>
    </Container>
  );
};
