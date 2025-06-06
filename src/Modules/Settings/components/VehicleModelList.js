import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Container, Row, Col, CardHeader } from 'shards-react';

import SettingVehicleModel from './SettingVehicleModel';
import { uniq, debounce } from 'lodash';
import { Input } from 'antd';

import { showWarn } from 'functions';
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
import { getCollection } from 'firebase/api';
import { distinctArr } from 'functions';
import { searchArr } from 'functions';
const { Search } = Input;

const VehicleModelList = ({ onSelect, onBack }) => {
  const { firestore } = useContext(FirebaseContext);
  const history = useHistory();

  const [showVehicleModelDetail, setShowVehicleModelDetail] = useState(false);
  const [selectedVehicleModel, setSelectedVehicleModel] = useState({});
  const [allData, setAllData] = useState([]);
  const [dArray, setData] = useState([]);
  const [productType, setProductType] = useState([]);
  const [header, setHeader] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('isNew');
  const [searchText, setSearchText] = useState(null);

  const arrangeData = async arr => {
    try {
      let isUsed = arr.filter(l => l.productCode.startsWith('2-'));
      let isNew = arr.filter(l => !l.productCode.startsWith('2-'));
      const newArr = [...isNew, ...isUsed];
      // showLog({ arr, isNew, isUsed, newArr });
      let result = uniq(newArr).map((l, i) => ({
        ...l,
        id: i,
        key: i
      }));
      return result;
    } catch (e) {
      showWarn(e);
    }
  };
  const _getData = useCallback(async () => {
    try {
      setLoading(true);
      let doc = await getCollection('data/products/vehicleList', [['deleted', '==', false]]);
      let arr = Object.keys(doc)
        .map(k => doc[k])
        .map((l, i) => ({
          ...l,
          id: i,
          key: i,
          header: l.header || 'อื่นๆ'
        }));
      setLoading(false);
      let pType = distinctArr(arr, ['productType']).map(l => l.productType);
      let head = distinctArr(arr, ['header']).map(l => l.header);
      let isNew = arr.filter(l => !l.isUsed);
      setData(
        isNew.map((l, i) => ({
          ...l,
          id: i,
          key: i
        }))
      );
      showLog({ arr });
      let result = await arrangeData(arr);
      setAllData(result);
      setProductType(pType);
      setHeader(head);
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    _getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const _search = async (txt, sType) => {
    try {
      if (!txt) {
        if (sType === 'all') {
          setData(allData);
        } else {
          let rArr = allData.filter(l => l.isUsed === (sType === 'isUsed'));
          let result = await arrangeData(rArr);
          setData(result);
        }
        setLoading(false);
        return;
      }
      // let arr = searchArr(dataRef.current, txt, ['expenseSubCategoryId', 'name']);
      setLoading(true);
      const sArr = searchArr(allData, txt, ['productCode', 'name', 'model', 'productType']);

      setLoading(false);
      let rArr = [];
      if (sType === 'all') {
        rArr = sArr.map((l, i) => ({
          ...l,
          id: i,
          key: i
        }));
      } else {
        rArr = sArr
          .filter(l => l.isUsed === (sType === 'isUsed'))
          .map((l, i) => ({
            ...l,
            id: i,
            key: i
          }));
      }
      let result = await arrangeData(rArr);
      setData(result);
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
    setType(sType);
    _search(searchText, sType);
  };

  const _onFinish = () => {
    setType('isNew');
    setShowVehicleModelDetail(false);
    _getData();
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
              key: 'productType',
              filters: distinctArr(dArray, ['productType']).map(it => ({
                value: it.productType,
                text: it.productType
              })),
              onFilter: (value, record) => record.productType === value
            },
            // {
            //   title: 'คำค้นหา',
            //   dataIndex: 'header',
            //   key: 'header',
            //   filters: distinctArr(data, ['header']).map((it) => ({
            //     value: it.header,
            //     text: it.header,
            //   })),
            //   onFilter: (value, record) => record.header === value,
            //   width: 100,
            // },
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
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ y: h(70) }}
        />
      </div>
      {showVehicleModelDetail && (
        <SettingVehicleModel
          vehicleModel={selectedVehicleModel}
          visible={showVehicleModelDetail}
          onFinish={_onFinish}
          onCancel={() => setShowVehicleModelDetail(false)}
        />
      )}
    </Container>
  );
};

export default VehicleModelList;
