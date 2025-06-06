import React, { useCallback, useContext, useState } from 'react';
import { Container, Row, Col, CardHeader } from 'shards-react';

import SettingPart from './SettingPart';
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
import { fetchSearchsEachField } from 'utils';
import { arrayForEach } from 'functions';
const { Search } = Input;

const PartList = () => {
  const { firestore } = useContext(FirebaseContext);
  const history = useHistory();

  const [showPartDetail, setShowPartDetail] = useState(false);
  const [selectedPart, setSelectedPart] = useState({});
  const [dArray, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('SKC');
  const [searchText, setSearchText] = useState(null);

  const _onSelect = async item => {
    try {
      load(true);
      const doc = await checkDoc('data', `products/partList/${item.pCode}`);
      if (doc) {
        let loadVehicle = formatValuesBeforeLoad(doc.data());
        setSelectedPart(loadVehicle);
        setShowPartDetail(true);
      }
      load(false);
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const _add = useCallback(() => {
    setSelectedPart({});
    setShowPartDetail(true);
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
      // let arr = searchArr(dataRef.current, txt, ['pCode', 'name']);
      let wheres = [];
      switch (iType) {
        // case 'SKC':
        //   wheres = [['partType', '==', 'SKC']];
        //   break;
        case 'KBN':
          wheres = [['partType', '==', 'KBN']];
          break;

        default:
          break;
      }
      setLoading(true);
      // const arr = await fetchFirestoreKeywords(fProps);
      let searchRef = firestore.collection('data/products/partList');
      if (wheres) {
        wheres.map(wh => {
          // console.log({ wh });
          searchRef = searchRef.where(wh[0], wh[1], wh[2]);
          return wh;
        });
      }

      let dataArr = [];

      await arrayForEach(['pCode', 'name'], async field => {
        const arr = await fetchSearchsEachField(txt, field, searchRef, [
          'pCode',
          'name',
          'partType',
          'slp',
          'div',
          'eff_date',
          'group'
        ]);
        dataArr = dataArr.concat(arr);
      });
      setLoading(false);
      let isSKC = dataArr.filter(l => !l.partType || l.partType !== 'KBN');
      let isKBN = dataArr.filter(l => !!l.partType && l.partType === 'KBN');
      const newArr = [...isSKC, ...isKBN];
      setData(
        uniq(newArr).map((l, i) => ({
          ...l,
          id: i,
          key: i,
          partType: l?.partType || 'SKC'
        }))
      );
    } catch (e) {
      showWarn(e);
      setLoading(false);
    }
  };

  const _import = () =>
    history.push('/utils/upload-data-from-excel-file', {
      params: { dataType: 'partList' }
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
            { label: 'SKC', value: 'SKC' },
            { label: 'KBN', value: 'KBN' },
            { label: 'ทั้งหมด', value: 'all' }
          ]}
          className="mt-3"
        />
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
              title: 'รหัสสินค้า',
              ellipsis: true,
              dataIndex: 'pCode',
              key: 'pCode'
            },
            {
              title: 'ประเภท',
              dataIndex: 'partType',
              key: 'partType'
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
      {showPartDetail && (
        <SettingPart partModel={selectedPart} visible={showPartDetail} onCancel={() => setShowPartDetail(false)} />
      )}
    </Container>
  );
};

export default PartList;
