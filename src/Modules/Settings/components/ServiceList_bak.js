import React, { useCallback, useContext, useState } from 'react';
import { Container, Row, Col, CardHeader } from 'shards-react';

import SettingService from './SettingService';
import { uniq, debounce } from 'lodash';
import { Input } from 'antd';

import { showWarn } from 'functions';
import { FirebaseContext } from '../../../firebase';
import EditableCellTable from 'components/EditableCellTable';
import { h } from 'api';
import { checkDoc } from 'firebase/api';
import { formatValuesBeforeLoad } from 'functions';
import { load } from 'functions';
import { useHistory } from 'react-router-dom';
import { AddButton } from 'elements';
import { isMobile } from 'react-device-detect';
import { fetchSearchsEachField } from 'utils';
import { arrayForEach } from 'functions';
const { Search } = Input;

const ServiceList = () => {
  const { firestore } = useContext(FirebaseContext);
  const history = useHistory();

  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [selectedService, setSelectedService] = useState({});
  const [dArray, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('SKC');
  const [searchText, setSearchText] = useState(null);

  const _onSelect = async item => {
    try {
      load(true);
      const doc = await checkDoc('data', `services/serviceList/${item.serviceCode}`);
      if (doc) {
        let loadVehicle = formatValuesBeforeLoad(doc.data());
        setSelectedService(loadVehicle);
        setShowServiceDetail(true);
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _add = useCallback(() => {
    setSelectedService({});
    setShowServiceDetail(true);
  }, []);

  const _onSearch = debounce(ev => {
    const txt = ev.target.value;
    setSearchText(txt);
    _search(txt, type);
  }, 200);

  const _search = async (txt, iType) => {
    try {
      if (!txt || (txt && txt.length < 3)) {
        setLoading(false);
        return setData([]);
      }
      // let arr = searchArr(dataRef.current, txt, ['serviceCode', 'name']);
      setLoading(true);
      // const arr = await fetchFirestoreKeywords(fProps);
      let searchRef = firestore.collection('data/services/serviceList');

      let dataArr = [];

      await arrayForEach(['serviceCode', 'name'], async field => {
        const arr = await fetchSearchsEachField(txt, field, searchRef, ['serviceCode', 'name', 'unitPrice']);
        dataArr = dataArr.concat(arr);
      });
      setLoading(false);
      setData(
        uniq(dataArr).map((l, i) => ({
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
              placeholder="พิมพ์เพื่อค้นหา รหัส / ชื่อบริการ"
              // onSearch={debounceSearch}
              onChange={e => _onSearch(e)}
              enterButton
              allowClear
            />
          </Col>
        </Row>
      </CardHeader>
      {/* <ListGroup flush>
            {dArray.map((key, idx) => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)}>
                {partList[key].partModelName}
              </ListGroupItem>
            ))}
          </ListGroup> */}
      <div className="px-0">
        <EditableCellTable
          dataSource={dArray}
          columns={[
            {
              title: 'ลำดับ',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              align: 'center'
            },
            {
              title: 'รหัสบริการ',
              ellipsis: true,
              dataIndex: 'serviceCode',
              key: 'serviceCode'
            },
            {
              title: 'ชื่อบริการ',
              dataIndex: 'name',
              key: 'name',
              ellipsis: true,
              width: 240
            }
          ]}
          onRow={(record, rowIndex) => {
            return {
              onClick: () => _onSelect(record)
            };
          }}
          hasChevron
          loading={loading}
          pagination={{ showSizeChanger: true }}
          scroll={{ y: h(70) }}
        />
      </div>
      {showServiceDetail && (
        <SettingService
          service={selectedService}
          visible={showServiceDetail}
          onCancel={() => setShowServiceDetail(false)}
        />
      )}
    </Container>
  );
};

export default ServiceList;
