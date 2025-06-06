import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, CardHeader } from 'shards-react';

import SettingService from './SettingService';
import { debounce } from 'lodash';
import { Input } from 'antd';

import { showWarn } from 'functions';
import EditableCellTable from 'components/EditableCellTable';
import { h } from 'api';
import { checkDoc } from 'firebase/api';
import { formatValuesBeforeLoad } from 'functions';
import { load } from 'functions';
import { AddButton } from 'elements';
import { isMobile } from 'react-device-detect';
import { getCollection } from 'firebase/api';
import { searchArr } from 'functions';
const { Search } = Input;

const ServiceList = () => {
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [selectedService, setSelectedService] = useState({});
  const [dArray, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);

  const _getData = async () => {
    try {
      let doc = await getCollection('data/services/serviceList');
      let arr = Object.keys(doc)
        .map(k => doc[k])
        .map((l, i) => ({
          ...l,
          id: i,
          key: i
        }));
      setData(arr);
      setAllData(arr);
    } catch (e) {
      showWarn(e);
    }
  };

  useEffect(() => {
    _getData();
  }, []);

  const _onSelect = async item => {
    try {
      load(true);
      const doc = await checkDoc('data', `services/serviceList/${item.serviceCode}`);
      if (doc) {
        let loadData = formatValuesBeforeLoad(doc.data());
        setSelectedService(loadData);
        setShowServiceDetail(true);
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _add = useCallback(() => {
    setSelectedService({
      serviceCode: null,
      name: null,
      unit: null,
      discount: null,
      unitPrice: null,
      creditTerm: null,
      description: null,
      remark: null
    });
    setShowServiceDetail(true);
  }, []);

  const _onSearch = debounce(ev => {
    const txt = ev.target.value;
    _search(txt);
  }, 200);

  const _search = async txt => {
    try {
      if (!txt) {
        setLoading(false);
        return setData(allData);
      }
      // let arr = searchArr(dataRef.current, txt, ['serviceCode', 'name']);
      setLoading(true);
      const dataArr = searchArr(allData, txt, ['name', 'serviceCode']);

      setLoading(false);
      setData(
        dataArr.map((l, i) => ({
          ...l,
          id: i,
          key: i
        }))
      );
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const _onDelete = async () => {};

  return (
    <Container fluid className="my-3">
      {/* Default Light Table */}
      <CardHeader>
        <Row form style={{ alignItems: 'center' }}>
          <Col md="1" className={isMobile ? 'mb-3' : ''}>
            <AddButton onClick={_add} />
          </Col>
          <Col md="7">
            <Search
              placeholder="พิมพ์เพื่อค้นหา รหัส / บริการ"
              // onSearch={debounceSearch}
              onChange={e => _onSearch(e)}
              enterButton
              allowClear
            />
          </Col>
        </Row>
      </CardHeader>
      <div className="px-0">
        <EditableCellTable
          dataSource={dArray}
          columns={[
            {
              title: '#',
              dataIndex: 'id',
              align: 'center'
            },
            {
              title: 'รหัสบริการ',
              ellipsis: true,
              dataIndex: 'serviceCode',
              render: txt => <div>{txt}</div>,
              width: 120
            },
            {
              title: 'ชื่อบริการ',
              dataIndex: 'name',
              ellipsis: true,
              width: 240
            }
          ]}
          // onRow={(record, rowIndex) => {
          //   return {
          //     onClick: () => !record?.deleted && _onSelect(record),
          //   };
          // }}
          hasEdit
          handleEdit={record => !record?.deleted && _onSelect(record)}
          loading={loading}
          pagination={{ showSizeChanger: true, pageSize: 100 }}
          scroll={{ y: h(70) }}
        />
      </div>
      <SettingService
        initDoc={selectedService}
        visible={showServiceDetail}
        onCancel={needUpdate => {
          setShowServiceDetail(false);
          needUpdate && _getData();
        }}
        onDelete={_onDelete}
      />
    </Container>
  );
};

export default ServiceList;
