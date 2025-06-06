import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Container, Row, Card, CardHeader, CardBody, CardFooter, Button } from 'shards-react';
import { Slide } from 'react-awesome-reveal';

import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../../firebase';
import SettingGiveaway from './SettingGiveaway';
import { uniq } from 'lodash';
import { sortArr } from 'functions';

const GiveawayList = ({ onSelect, onBack }) => {
  const { theme } = useSelector(state => state.global);
  const { giveaways } = useSelector(state => state.data);

  const [showGiveawayDetail, setShowGiveawayDetail] = useState(false);
  const [selectedGiveaway, setSelectedGiveaway] = useState({});

  const { api } = useContext(FirebaseContext);

  useEffect(() => {
    api.getGiveaways();
  }, [api]);

  const _onSelect = item => {
    setSelectedGiveaway(item);
    setShowGiveawayDetail(true);
  };

  const _add = useCallback(() => {
    setSelectedGiveaway({});
    setShowGiveawayDetail(true);
  }, []);

  // {
  //   giveawayId: 'W955J-00020',
  //   giveawayNo: 'L5018DT153278',
  //   giveawayName: 'L5018',
  //   description: '',
  //   standardCost: 639929.5,
  //   listPrice: 744000,
  //   giveawayCategoryId: 'vh001',
  // }

  let dArray = uniq(Object.keys(giveaways)).map((key, idx) => {
    const { giveawayName, giveawayNo, listPrice, standardCost, description, remark, _key } = giveaways[key];
    return {
      giveawayName,
      giveawayNo,
      listPrice,
      standardCost,
      description,
      remark,
      _key
    };
  });

  dArray = sortArr(dArray, 'giveawayName');

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
              <h6 className="m-0">ของแถม</h6>
            </div>
          </Row>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          {/* <ListGroup flush>
            {Object.keys(giveaways).map((key, idx) => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)}>
                {giveaways[key].giveawayName}
              </ListGroupItem>
            ))}
          </ListGroup> */}
          <Container fluid className="px-0">
            <table className="table mb-0">
              <thead className="py-2 bg-light text-semibold border-bottom">
                <tr>
                  <th>ชื่อของแถม</th>
                  <th className="text-center">รหัส</th>
                  <th className="text-center">มูลค่า</th>
                  <th className="text-center">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {dArray.map((item, idx) => (
                  <tr key={idx} onClick={() => _onSelect(item)}>
                    <td className="mx-2">
                      <span>{item.giveawayName}</span>
                    </td>
                    <td className="text-center mr-2">
                      <span>{item.giveawayNo}</span>
                    </td>
                    <td className="text-center mr-2">
                      <span>{item.listPrice}</span>
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
        {showGiveawayDetail && (
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
                  <Button onClick={() => setShowGiveawayDetail(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{selectedGiveaway.name}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingGiveaway giveaway={selectedGiveaway} onCancel={() => setShowGiveawayDetail(false)} />
              </CardBody>
            </Card>
          </Slide>
        )}
      </Card>
    </Container>
  );
};

export default GiveawayList;
