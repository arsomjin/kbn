import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { Col, Container, Row } from 'shards-react';
import { useSelector } from 'react-redux';
import { columns, columns2, getStockData } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { showWarn } from 'functions';
import { h } from 'api';
import PageTitle from 'components/common/PageTitle';
import Toggles from 'components/Toggles';
import { useMergeState } from 'api/CustomHooks';
import { InputGroup } from 'elements';

export default () => {
  const { user } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [modelFilters, setModelFilters] = useState();
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useMergeState({
    isVehicle: true,
    isUsed: false,
    branchCode: user?.branch || '0450'
  });

  const _onValuesChange = val => {
    setHeaders(val);
  };

  useEffect(() => {
    const _getData = async val => {
      try {
        setLoading(true);
        let stocks = await getStockData(val);
        setLoading(false);
        setData(stocks.result);
        setModelFilters(stocks.fModels);
      } catch (e) {
        showWarn(e);
      }
    };
    _getData(headers);
  }, [headers]);

  let mColumns = headers.branchCode === 'all' ? columns : columns2;
  if (!!modelFilters) {
    let mId = mColumns.findIndex(l => l.dataIndex === 'model');
    if (mId > -1) {
      mColumns[mId] = {
        ...mColumns[mId],
        filters: modelFilters,
        onFilter: (value, record) => record.productPCode === value
      };
    }
  }

  return (
    <Container fluid className="main-content-container p-3">
      <Form
        form={form}
        initialValues={{
          // productPCode: 'tc88215112',
          branchCode: user?.branch || '0450',
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
                  <PageTitle sm="4" title="คลังสินค้า" subtitle="คลังสินค้า" className="text-sm-left" />
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
                  <Col md="4">
                    <Form.Item name="branchCode">
                      <InputGroup spans={[6, 18]} addonBefore="สาขา" branch hasAll onlyUserBranch={user.branch} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          );
        }}
      </Form>
      <EditableCellTable dataSource={data} columns={mColumns} loading={loading} scroll={{ y: h(80) }} />
    </Container>
  );
};
