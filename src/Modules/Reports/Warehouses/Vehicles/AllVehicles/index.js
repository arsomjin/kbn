import React, { useContext, useEffect, useState } from 'react';
import { useGeographicData } from 'hooks/useGeographicData';
import { Form } from 'antd';
import { Container } from 'shards-react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { columns, getVehicleData } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { TableSummary } from 'api/Table';
import { FirebaseContext } from '../../../../../firebase';
import { firstKey } from 'functions';
import { showWarn } from 'functions';
import { h } from 'api';

export default () => {
  const { api, firestore } = useContext(FirebaseContext);
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const { getDefaultBranch } = useGeographicData();
  const { branches } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState(user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));

  const _onValuesChange = val => {
    //  showLog({ val });
    const changeKey = firstKey(val);
    if (['branchCode', 'date'].includes(changeKey)) {
      if (changeKey === 'branchCode') {
        setBranch(val[changeKey]);
      } else {
        setDate(val[changeKey]);
      }
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        let arr = await getVehicleData(branches);
        setData(arr);
      } catch (e) {
        showWarn(e);
      }
    };

    getData();
  }, [branches]);

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          branchCode: user?.branch || getDefaultBranch() || user?.homeBranch || (user?.allowedBranches?.[0]) || '0450',
          date: moment(),
          model: null
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
                {/* <BranchDateHeader
                  title="รับเข้ารถ/อุปกรณ์"
                  subtitle="คลังสินค้า"
                  disableAllBranches
                  steps={CommonSteps}
                  activeStep={0}
                /> */}
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
          <TableSummary pageData={pageData} dataLength={columns.length} startAt={2} sumKeys={['gasCost', 'distance']} />
        )}
        // pagination={{ pageSize: 50 }}
        scroll={{ y: h(80) }}
      />
    </Container>
  );
};
