import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Button } from 'shards-react';
import { Slide } from 'react-awesome-reveal';

import { useSelector } from 'react-redux';

import SettingBranch from './SettingBranch';
import SettingLocation from './SettingLocation';
import SettingWarehouse from './SettingWarehouse';
import MainContainer from './MainContainer';
import { FirebaseContext } from '../../../firebase';

const BranchList = ({ onSelect, toggleMain, hideMain }) => {
  const { api } = useContext(FirebaseContext);

  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.global);
  const { branches, locations, warehouses } = useSelector(state => state.data);
  const [showBranchDetail, setShowBranchDetail] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState({});

  const grantBranch = user.isDev || (user.permissions && user.permissions.permission601);

  useEffect(() => {
    api.getBranches();
    api.getLocations();
    api.getWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onSelect = key => {
    setSelectedBranch(branches[key]);
    setShowBranchDetail(true);
  };

  const _add = useCallback(() => {
    setSelectedBranch({});
    setShowBranchDetail(true);
  }, []);

  return (
    <MainContainer>
      <Card small className="mb-4">
        <CardHeader className="border-bottom">
          <Row
            style={{
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {/* {isMobile && hideMain && (
              <Button onClick={() => toggleMain()} className="btn-white ml-3">
                &larr; กลับ
              </Button>
            )} */}
            <h6 className="m-0 mr-3 ml-3">สาขา</h6>
          </Row>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            {Object.keys(branches).map(key => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)} disabled={!grantBranch}>
                {branches[key].branchName}
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
        {/* <CardFooter>
              <Button theme="light" onClick={_add}>
                <i className="material-icons" style={{ fontSize: 22 }}>
                  add
                </i>
              </Button>
            </CardFooter> */}
        {showBranchDetail && (
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
                  <Button onClick={() => setShowBranchDetail(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{selectedBranch.branchName}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingBranch
                  branch={selectedBranch}
                  onCancel={() => setShowBranchDetail(false)}
                  showLocation={() => setShowLocation(true)}
                  showWarehouse={() => setShowWarehouse(true)}
                />
              </CardBody>
            </Card>
          </Slide>
        )}
        {showWarehouse && selectedBranch && selectedBranch.warehouseId && (
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
              zIndex: 50
              // backgroundColor: theme.colors.surface,
            }}
          >
            <Card small className="mb-4 d-flex">
              <CardHeader className="border-bottom">
                <Row form style={{ alignItems: 'center' }}>
                  <Button onClick={() => setShowWarehouse(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>
                      {warehouses[selectedBranch.warehouseId].warehouseName}
                    </h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingWarehouse
                  warehouse={warehouses[selectedBranch.warehouseId]}
                  onCancel={() => setShowWarehouse(false)}
                  showLocation={() => setShowLocation(true)}
                />
              </CardBody>
            </Card>
          </Slide>
        )}
        {showLocation && selectedBranch && selectedBranch.locationId && (
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
              zIndex: 100
              // backgroundColor: theme.colors.surface,
            }}
          >
            <Card small className="mb-4 d-flex">
              <CardHeader className="border-bottom">
                <Row form style={{ alignItems: 'center' }}>
                  <Button onClick={() => setShowLocation(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{locations[selectedBranch.locationId].locationName}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingLocation
                  location={locations[selectedBranch.locationId]}
                  onCancel={() => setShowLocation(false)}
                />
              </CardBody>
            </Card>
          </Slide>
        )}
      </Card>
    </MainContainer>
  );
};
export default BranchList;
