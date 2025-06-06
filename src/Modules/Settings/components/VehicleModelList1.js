import React, { useCallback, useContext, useState } from 'react';
import { Container, Row, Col, CardHeader } from 'shards-react';

import SettingVehicleModel from './SettingVehicleModel';
import { uniq, debounce } from 'lodash';
import { Input } from 'antd';

import { showWarn } from 'functions';
import { fetchFirestoreKeywords } from 'utils';
import { FirebaseContext } from '../../../firebase';
import EditableCellTable from 'components/EditableCellTable';
import { h } from 'api';
import { checkDoc } from 'firebase/api';
import { formatValuesBeforeLoad } from 'functions';
import { load } from 'functions';
import { Button as AButton } from 'elements';
import { useHistory } from 'react-router-dom';
import { AddButton } from 'elements';
import { isMobile } from 'react-device-detect';
import Toggles from 'components/Toggles';
import { showLog } from 'functions';
const { Search } = Input;

const VehicleModelList = ({ onSelect, onBack }) => {
  const { firestore } = useContext(FirebaseContext);
  const history = useHistory();

  const [showVehicleModelDetail, setShowVehicleModelDetail] = useState(false);
  const [selectedVehicleModel, setSelectedVehicleModel] = useState({});
  const [dArray, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('isNew');
  const [searchText, setSearchText] = useState(null);

  const _onSelect = async item => {
    try {
      load(true);
      const doc = await checkDoc('data', `products/vehicleList/${item.productCode}`);
      if (doc) {
        let loadVehicle = formatValuesBeforeLoad(doc.data());
        setSelectedVehicleModel(loadVehicle);
        setShowVehicleModelDetail(true);
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _add = useCallback(() => {
    setSelectedVehicleModel({});
    setShowVehicleModelDetail(true);
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
      showLog('SEARCHING...');
      // let arr = searchArr(dataRef.current, txt, ['productCode', 'name']);
      let wheres = [['deleted', '==', false]];
      // let wheres = [];
      switch (iType) {
        case 'isNew':
          wheres = [...wheres, ['isUsed', '==', false]];
          break;
        case 'isUsed':
          wheres = [...wheres, ['isUsed', '==', true]];
          break;

        default:
          break;
      }
      const fProps = {
        searchText: txt,
        searchCollection: 'data/products/vehicleList',
        orderBy: ['productCode', 'name'],
        labels: ['productCode', 'name', 'productType', 'listPrice', 'isUsed', 'wsPrice'],
        wheres,
        firestore,
        limit: 50
      };
      setLoading(true);
      const arr = await fetchFirestoreKeywords(fProps);
      setLoading(false);
      let isUsed = arr.filter(l => l.productCode.startsWith('2-'));
      let isNew = arr.filter(l => !l.productCode.startsWith('2-'));
      const newArr = [...isNew, ...isUsed];
      // showLog({ arr, isNew, isUsed, newArr });
      setData(
        uniq(newArr).map((l, i) => ({
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

  const _import = () =>
    history.push('/utils/upload-data-from-excel-file', {
      params: { dataType: 'vehicleList' }
    });

  const _onTypeChange = e => {
    let sType = e.target.value;
    !!searchText && searchText.length > 2 && _search(searchText, sType);
    setType(sType);
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
              placeholder="พิมพ์เพื่อค้นหา รหัส / ชื่อสินค้า / รุ่น / ประเภท"
              // onSearch={debounceSearch}
              onChange={e => _onSearch(e)}
              enterButton
              allowClear
            />
          </Col>
          <Col md="4" className={isMobile ? 'mt-3' : 'pl-3'}>
            <AButton type="primary" ghost onClick={_import}>
              นำเข้าข้อมูลจากไฟล์ Excel
            </AButton>
          </Col>
          {/* <div
              className="d-flex"
              style={{
                justifyContent: 'flex-end',
                marginRight: '10px',
              }}
            >
              <h6 className="m-0">รายชื่อรถและอุปกรณ์</h6>
            </div> */}
        </Row>
        <Toggles
          value={type}
          onChange={_onTypeChange}
          buttons={[
            { label: 'ใหม่', value: 'isNew' },
            { label: 'มือสอง', value: 'isUsed' },
            { label: 'ทั้งหมด', value: 'all' }
          ]}
          className="mt-3"
        />
      </CardHeader>
      {/* <ListGroup flush>
            {dArray.map((key, idx) => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)}>
                {vehicleList[key].vehicleModelName}
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
              title: 'รหัสสินค้า',
              ellipsis: true,
              dataIndex: 'productCode',
              key: 'productCode'
            },
            {
              title: 'ประเภท',
              dataIndex: 'productType',
              key: 'productType'
            },
            {
              title: 'ชื่อสินค้า',
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
      {showVehicleModelDetail && (
        <SettingVehicleModel
          vehicleModel={selectedVehicleModel}
          visible={showVehicleModelDetail}
          onCancel={() => setShowVehicleModelDetail(false)}
        />
      )}
    </Container>
  );
};

export default VehicleModelList;
