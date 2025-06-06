import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form, Tabs } from 'antd';
import PageTitle from 'components/common/PageTitle';
import { Container, Row, CardHeader } from 'shards-react';
import { useHistory } from 'react-router';
import { DownloadOutlined } from '@ant-design/icons';
import { initSearchValue, renderHeader, columns, discountColumns } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { getSearchData } from 'firebase/api';
import { showWarn, distinctArr, toCurrency } from 'functions';
import { TableSummary } from 'api/Table';
import { TAB_HEIGHT } from 'data/Constant';
import { TAB_WIDTH } from 'data/Constant';
import { getLatestData } from 'firebase/api';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { getNameFromUid } from 'Modules/Utils';

const { TabPane } = Tabs;
export default ({}) => {
  const history = useHistory();
  const [form] = Form.useForm();
  const { users, employees } = useSelector(state => state.data);
  const [data, setData] = useState([]);
  const [discountData, setDiscountData] = useState([]);
  const [latestImport, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchValuesRef = useRef(initSearchValue);

  const _getData = useCallback(async sValues => {
    try {
      setLoading(true);
      let sData = [];
      let mData = await getSearchData('sections/sales/partGroups', sValues, ['saleDate', 'importTime'], {
        date: 'saleDate'
      });
      searchValuesRef.current = sValues;
      let dData = distinctArr(mData, ['saleDate', 'branchCode'], ['netTotal', 'amtOilType', 'amtPartType']);
      let discountArr = distinctArr(
        mData,
        ['saleDate', 'branchCode'],
        ['discountCoupon', 'discountPointRedeem', 'SKCDiscount', 'SKCManualDiscount', 'AD_Discount']
      );
      dData = dData.map((it, id) => ({
        ...it,
        id,
        netTotal: toCurrency(it.netTotal),
        amtOilType: toCurrency(it.amtOilType),
        amtPartType: toCurrency(it.amtPartType)
      }));
      discountArr = discountArr.map((it, id) => ({
        ...it,
        id,
        discountCoupon: toCurrency(it.discountCoupon),
        discountPointRedeem: toCurrency(it.discountPointRedeem),
        SKCDiscount: toCurrency(it.SKCDiscount),
        SKCManualDiscount: toCurrency(it.SKCManualDiscount),
        AD_Discount: toCurrency(it.AD_Discount)
      }));
      //  showLog({ sData, dData, discountArr, sValues });
      setData(dData);
      setDiscountData(discountArr);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, []);

  const _getLatestImport = useCallback(async () => {
    try {
      let latestData = await getLatestData({
        collection: 'sections/sales/parts',
        orderBy: 'importTime',
        desc: true
      });
      if (latestData) {
        let importBy = null;
        latestData.forEach(rec => {
          //  showLog({ rec: rec.data() });
          importBy = { by: rec.data().importBy, time: rec.data().importTime };
        });
        const eName = await getNameFromUid({
          uid: importBy.by,
          users,
          employees
        });
        setLatest({ time: importBy.time, by: eName });
      }
    } catch (e) {
      showWarn(e);
    }
  }, [employees, users]);

  useEffect(() => {
    _getData(initSearchValue);
    _getLatestImport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = searchValues => {
    _getData({ ...searchValuesRef.current, ...searchValues });
  };

  return (
    <Container fluid className="main-content-container p-3">
      <Row noGutters className="page-header px-3 bg-light">
        <PageTitle sm="4" title="อะไหล่" subtitle="งานขาย" className="text-sm-left" />
      </Row>
      <Form form={form} initialValues={initSearchValue} onValuesChange={onSearch} layout="vertical">
        {values => {
          //  showLog({ values });
          return (
            <>
              <CardHeader className="border-bottom border-top pt-3 mt-3">
                {/* <Row style={{ justifyContent: 'flex-end', alignItems: 'center' }} form> */}
                <Button
                  onClick={() =>
                    history.push('/utils/upload-data-from-excel-file', {
                      params: { dataType: 'sellParts' }
                    })
                  }
                  className="mr-2 my-2"
                  icon={<DownloadOutlined />}
                >
                  นำเข้าข้อมูลการขายอะไหล่ จากระบบ SKC
                </Button>
                {latestImport && (
                  <strong className="text-muted ml-3">{`*นำเข้าข้อมูลล่าสุด ${moment(latestImport.time).format(
                    'lll'
                  )} โดย ${latestImport.by}`}</strong>
                )}
                {/* </Row> */}
              </CardHeader>
              {renderHeader()}
              <Tabs type="card">
                <TabPane tab="รายได้" key="1">
                  <div
                    style={{
                      width: TAB_WIDTH,
                      height: TAB_HEIGHT
                    }}
                  >
                    <EditableCellTable
                      dataSource={data}
                      columns={columns}
                      loading={loading}
                      summary={pageData => (
                        <TableSummary
                          pageData={pageData}
                          dataLength={columns.length}
                          startAt={3}
                          sumKeys={['amtPartType', 'amtOilType', 'netTotal']}
                        />
                      )}
                    />
                  </div>
                </TabPane>
                <TabPane tab="ส่วนลด" key="2">
                  <div
                    style={{
                      width: TAB_WIDTH,
                      height: TAB_HEIGHT
                    }}
                  >
                    <EditableCellTable
                      dataSource={discountData}
                      columns={discountColumns}
                      loading={loading}
                      summary={pageData => (
                        <TableSummary
                          pageData={pageData}
                          dataLength={discountColumns.length}
                          startAt={2}
                          sumKeys={[
                            'discountCoupon',
                            'discountPointRedeem',
                            'SKCManualDiscount',
                            'SKCDiscount',
                            'AD_Discount'
                          ]}
                        />
                      )}
                    />
                  </div>
                </TabPane>
              </Tabs>
            </>
          );
        }}
      </Form>
    </Container>
  );
};
