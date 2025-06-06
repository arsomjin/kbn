import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Container, Row, Card, CardHeader, CardBody, CardFooter, Button } from 'shards-react';
import { Slide } from 'react-awesome-reveal';

import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../../firebase';
import SettingEquipmentList from './SettingEquipmentList';
import { uniq } from 'lodash';
import { sortArr } from 'functions';

const EquipmentList = ({ onSelect, onBack }) => {
  const { theme } = useSelector(state => state.global);
  const { equipmentLists } = useSelector(state => state.data);

  const [showEquipmentListDetail, setShowEquipmentListDetail] = useState(false);
  const [selectedEquipmentList, setSelectedEquipmentList] = useState({});

  const { api } = useContext(FirebaseContext);

  useEffect(() => {
    api.getEquipmentLists();
  }, [api]);

  const _onSelect = item => {
    setSelectedEquipmentList(item);
    setShowEquipmentListDetail(true);
  };

  const _add = useCallback(() => {
    setSelectedEquipmentList({});
    setShowEquipmentListDetail(true);
  }, []);

  // {
  //   vehicleId: 'W955J-00020',
  //   vehicleId: 'L5018DT153278',
  //   vehicleName: 'L5018',
  //   description: '',
  //   standardCost: 639929.5,
  //   listPrice: 744000,
  //   vehicleCategoryId: 'vh001',
  // }

  let dArray = uniq(Object.keys(equipmentLists)).map((key, idx) => {
    const { equipmentName, equipmentNo, listPrice, standardCost, description, name, remark, _key } =
      equipmentLists[key];
    return {
      equipmentName,
      equipmentNo,
      listPrice,
      standardCost,
      description,
      name,
      remark,
      _key
    };
  });

  dArray = sortArr(dArray, 'name');

  return (
    <Container fluid>
      {/* Default Light Table */}
      <Card small className="mb-4">
        <CardHeader className="border-bottom">
          <Row form style={{ alignItems: 'center' }}>
            <Button onClick={onBack} className="btn-white mr-3">
              &larr; กลับ
            </Button>
            <div
              className="ml-sm-auto mt-2"
              style={{
                justifyContent: 'flex-end',
                marginRight: '10px'
              }}
            >
              <h6 className="m-0">รุ่นอุปกรณ์</h6>
            </div>
          </Row>
        </CardHeader>
        <CardBody className="p-0 px-4">
          {/* <ListGroup flush>
            {dArray.map((key, idx) => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)}>
                {`${equipmentLists[key].name} ${equipmentLists[key].equipmentName}`}
              </ListGroupItem>
            ))}
          </ListGroup> */}

          <Container fluid className="px-0">
            <table className="table mb-0">
              <thead className="py-2 bg-light text-semibold border-bottom">
                <tr>
                  <th>อุปกรณ์</th>
                  <th className="text-center">รุ่น</th>
                  <th className="text-center">รหัส</th>
                  <th className="text-center">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {dArray.map((item, idx) => (
                  <tr key={idx} onClick={() => _onSelect(item)}>
                    <td className="mx-2">
                      <span>{item.name}</span>
                    </td>
                    <td className="text-center mr-2">
                      <span>{item.equipmentName}</span>
                    </td>
                    <td className="text-center mr-2">
                      <span>{item.equipmentNo}</span>
                    </td>
                    <td className="text-center lo-stats__actions">
                      <Button onClick={() => _onSelect(item)} size="sm" theme="white">
                        รายละเอียด
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Container>
        </CardBody>
        <CardFooter className="border-top">
          <Button theme="light" onClick={_add}>
            <i className="material-icons" style={{ fontSize: 22 }}>
              add
            </i>
          </Button>
        </CardFooter>
        {showEquipmentListDetail && (
          <Slide
            triggerOnce
            direction="right"
            duration={500}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 20
              // backgroundColor: theme.colors.surface,
            }}
          >
            <Card small className="mb-4 d-flex">
              <CardHeader className="border-bottom">
                <Row form style={{ alignItems: 'center' }}>
                  <Button onClick={() => setShowEquipmentListDetail(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{selectedEquipmentList.equipmentName}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingEquipmentList
                  equipmentList={selectedEquipmentList}
                  onCancel={() => setShowEquipmentListDetail(false)}
                />
              </CardBody>
            </Card>
          </Slide>
        )}
      </Card>
    </Container>
  );
};

export default EquipmentList;
