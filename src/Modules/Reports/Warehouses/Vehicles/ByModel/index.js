import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Form } from 'antd';
import { Col, Container, Row } from 'shards-react';
import { useHistory } from 'react-router';
import { useSelector } from 'react-redux';
import { columns, getVehicleData, expandedRowRender } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { FirebaseContext } from '../../../../../firebase';
import { firstKey } from 'functions';
import { showWarn } from 'functions';
import { h } from 'api';
import PageTitle from 'components/common/PageTitle';
import Toggles from 'components/Toggles';
import VehicleSelector from 'components/VehicleSelector';
import { removeAllNonAlphaNumericCharacters } from 'utils/RegEx';

export default () => {
  const { api, firestore } = useContext(FirebaseContext);
  const history = useHistory();
  const { user } = useSelector(state => state.auth);
  const { branches, modelList } = useSelector(state => state.data);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const _onValuesChange = val => {
    const changeKey = firstKey(val);
    // showLog({ changeKey, val });
    if (changeKey === 'productCode') {
      let productPCode = removeAllNonAlphaNumericCharacters(val[changeKey]);
      _getData(productPCode);
    } else {
      form.setFieldsValue({ productCode: null });
      setData([]);
    }
  };

  useEffect(() => {
    if (!modelList?.ts || (!!modelList?.ts && Date.now() - modelList.ts > 24 * 60 * 60 * 1000)) {
      api.getModelLists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _getData = useCallback(
    async pCode => {
      try {
        let arr = await getVehicleData(pCode, branches);
        setData(arr);
      } catch (e) {
        showWarn(e);
      }
    },
    [branches]
  );

  // useEffect(() => {
  //   _getData('tc88215112');
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          // productCode: 'tc88215112',
          productPCode: null,
          isVehicle: true,
          isUsed: false
        }}
        layout="vertical"
        size="small"
        onValuesChange={_onValuesChange}
      >
        {values => {
          return (
            <>
              <div className="page-header p-3 ">
                <Row>
                  <PageTitle sm="4" title="รายการสินค้า" subtitle="คลังสินค้า" className="text-sm-left" />
                </Row>
              </div>
              <div className="px-3 mt-3">
                <Row>
                  <Col md="4">
                    <Form.Item name="isVehicle">
                      <Toggles
                        buttons={[
                          { label: 'รถ', value: true },
                          { label: 'อุปกรณ์', value: false },
                          { label: 'ทั้งหมด', value: undefined }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="productCode">
                      {/* <ModelSelector
                        style={{ display: 'flex' }}
                        isUsed={values.isUsed}
                        isVehicle={values.isVehicle}
                      /> */}
                      <VehicleSelector placeholder="รุ่น/ รหัส / ชื่อสินค้า" record={values} />
                    </Form.Item>
                  </Col>
                  <Col md="4">
                    <Form.Item name="isUsed">
                      <Toggles
                        buttons={[
                          { label: 'ใหม่', value: false },
                          { label: 'มือสอง', value: true },
                          { label: 'ทั้งหมด', value: undefined }
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          );
        }}
      </Form>
      <EditableCellTable
        dataSource={data}
        columns={columns}
        loading={loading}
        // summary={(pageData) => (
        //   <TableSummary
        //     pageData={pageData}
        //     dataLength={columns.length}
        //     startAt={2}
        //     sumKeys={['qty']}
        //   />
        // )}
        // pagination={{ pageSize: 50 }}
        scroll={{ y: h(80) }}
        expandable={{
          expandedRowRender
        }}
      />
    </Container>
  );
};
