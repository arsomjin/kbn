import React, { useCallback, useState } from 'react';
import { Container, Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Button, CardFooter } from 'shards-react';
import { Slide } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';

import SettingBank from './SettingBank';
import { uniq } from 'lodash';
import { sortArr } from 'functions';

const BankList = ({ onSelect, onBack }) => {
  const { theme } = useSelector(state => state.global);
  const { banks } = useSelector(state => state.data);

  const [showBankDetail, setShowBankDetail] = useState(false);
  const [selectedBank, setSelectedBank] = useState({});

  const _onSelect = item => {
    setSelectedBank(item);
    setShowBankDetail(true);
  };

  const _add = useCallback(() => {
    setSelectedBank({});
    setShowBankDetail(true);
  }, []);

  let dArray = uniq(Object.keys(banks)).map((key, idx) => {
    const { accNo, bankName, branch, name, remark, _key } = banks[key];
    return {
      accNo,
      bankName,
      branch,
      name,
      remark,
      _key
    };
  });

  dArray = sortArr(dArray, 'bankName');

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
              <h6 className="m-0">บัญชีธนาคาร</h6>
            </div>
          </Row>
        </CardHeader>
        <CardBody className="p-2">
          <ListGroup flush>
            {dArray.map((item, idx) => (
              <ListGroupItem key={idx} action onClick={() => _onSelect(item)}>
                <span className="text-semibold text-fiord-blue mr-3">{`${idx + 1}.`}</span>
                <span className="text-semibold text-fiord-blue">{item.name}</span>
                <span className="ml-4 text-right text-semibold text-reagent-gray">{item.accNo}</span>
                <span className="ml-4 text-right text-semibold text-reagent-gray">{item.bankName}</span>
                <span className="ml-4 text-right text-semibold text-reagent-gray">{item.branch}</span>
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
        <CardFooter className="border-top">
          <Button theme="light" onClick={_add}>
            <i className="material-icons" style={{ fontSize: 22 }}>
              add
            </i>
          </Button>
        </CardFooter>
        {showBankDetail && (
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
                  <Button onClick={() => setShowBankDetail(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{selectedBank.name}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingBank bank={selectedBank} onCancel={() => setShowBankDetail(false)} />
              </CardBody>
            </Card>
          </Slide>
        )}
      </Card>
    </Container>
  );
};
export default BankList;
