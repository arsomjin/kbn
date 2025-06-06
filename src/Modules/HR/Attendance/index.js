import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Form } from 'antd';
import PageTitle from 'components/common/PageTitle';
import { Container, Row, CardHeader } from 'shards-react';
import { useHistory } from 'react-router';
import { DownloadOutlined } from '@ant-design/icons';
import { initSearchValue, renderHeader, getColumns } from './api';
import EditableCellTable from 'components/EditableCellTable';
import { getSearchData } from 'firebase/api';
import { showWarn } from 'functions';
import { getLatestData } from 'firebase/api';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { getNameFromUid } from 'Modules/Utils';
import { h } from 'api';
import { createArrOfLength } from 'functions';
import { sortArr } from 'functions';

const eCol = [
  ...createArrOfLength(13).map(it => ({
    title: (it + 1).toString(),
    dataIndex: (it + 1).toString(),
    align: 'center',
    width: 60
  }))
];

const getExtraCol = snap => {
  let result = { ...snap };
  createArrOfLength(13).map(it => {
    result[(it + 1).toString()] = snap[(it + 1).toString()] || '';
    return it;
  });
  return result;
};

export default ({}) => {
  const history = useHistory();
  const pathName = history.location.pathname;
  const [form] = Form.useForm();
  const { users, employees, branches } = useSelector(state => state.data);
  const [data, setData] = useState([]);
  const [latestImport, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchValuesRef = useRef(initSearchValue);

  const _getData = useCallback(async sValues => {
    try {
      setLoading(true);
      let filters = { ...sValues };
      let mData = await getSearchData('sections/hr/importFingerPrint', filters, ['employeeCode', 'date']);
      searchValuesRef.current = sValues;
      mData = sortArr(
        mData.filter(l => !!l.employeeCode),
        'employeeCode'
      ).map((it, id) => ({
        ...getExtraCol(it),
        id,
        key: id
      }));
      setData(mData);
      setLoading(false);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, []);

  const _getLatestImport = useCallback(async () => {
    try {
      let latestData = await getLatestData({
        collection: 'sections/hr/importFingerPrint',
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
        <PageTitle sm="4" title="ข้อมูลสแกนลายนิ้วมือ" subtitle="งานบุคคล" className="text-sm-left" />
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
                      params: { dataType: 'fingerPrint' }
                    })
                  }
                  className="mr-2 my-2"
                  icon={<DownloadOutlined />}
                >
                  อัปโหลดข้อมูล สแกนลายนิ้วมือ
                </Button>
                {latestImport && (
                  <strong className="text-muted ml-3">{`*นำเข้าข้อมูลล่าสุด ${moment(latestImport.time).format(
                    'lll'
                  )} โดย ${latestImport.by}`}</strong>
                )}
                {/* </Row> */}
              </CardHeader>
              {renderHeader()}
              <EditableCellTable
                dataSource={data}
                columns={[...getColumns(data), ...eCol]}
                loading={loading}
                pagination={{ pageSize: 50, hideOnSinglePage: true }}
                scroll={{ y: h(70) }}
              />
            </>
          );
        }}
      </Form>
    </Container>
  );
};
