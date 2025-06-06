import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { Container } from 'shards-react';
import moment from 'moment';
import { columns, getVehicleTransferData, expandedRowRender } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { firstKey } from 'functions';
import { showWarn } from 'functions';
import { h } from 'api';
import { DatePicker } from 'elements';
import PageTitle from 'components/common/PageTitle';

export default () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(moment().format('YYYY-MM'));

  const _onValuesChange = val => {
    //  showLog({ val });
    const changeKey = firstKey(val);
    if (['month'].includes(changeKey)) {
      setMonth(val[changeKey]);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        let arr = await getVehicleTransferData(month);
        setLoading(false);
        setData(arr);
      } catch (e) {
        showWarn(e);
      }
    };

    getData();
  }, [month]);

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          month: moment().format('YYYY-MM')
        }}
        // layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <div className="px-3 bg-white">
                <PageTitle
                  sm="8"
                  title="การโอนย้ายระหว่างสาขา"
                  subtitle="รายงาน - คลังสินค้า"
                  className="text-sm-left"
                />
              </div>
              <div className="pt-3 d-flex justify-content-center">
                <Form.Item name="month" label="ประจำเดือน">
                  <DatePicker
                    picker="month"
                    // size="middle"
                    className="text-primary"
                  />
                </Form.Item>
              </div>
            </>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        loading={loading}
        summary={pageData => (
          <TableSummary pageData={pageData} dataLength={columns.length} startAt={8} sumKeys={['qty']} />
        )}
        // pagination={{ pageSize: 50 }}
        scroll={{ y: h(80) }}
        expandable={{
          expandedRowRender
        }}
      />
    </Container>
  );
};
