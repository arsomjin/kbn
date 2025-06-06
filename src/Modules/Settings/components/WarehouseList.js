import React, { useState } from 'react';
import { Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Button } from 'shards-react';
import { Slide } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';
import { isMobile } from 'react-device-detect';

import SettingWarehouse from './SettingWarehouse';
import SettingLocation from './SettingLocation';
import MainContainer from './MainContainer';

const WarehouseList = ({ onSelect, toggleMain, hideMain }) => {
  const { theme } = useSelector(state => state.global);
  const { user } = useSelector(state => state.auth);
  const { warehouses, locations } = useSelector(state => state.data);

  const [showWarehouseDetail, setShowWarehouseDetail] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState({});
  const [showLocation, setShowLocation] = useState(false);

  const grantBranch = user.isDev || (user.permissions && user.permissions.permission601);

  const _onSelect = key => {
    setSelectedWarehouse(warehouses[key]);
    setShowWarehouseDetail(true);
  };
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
            {isMobile && hideMain && (
              <Button onClick={() => toggleMain()} className="btn-white ml-3">
                &larr; กลับ
              </Button>
            )}
            <h6 className="m-0 mr-3 ml-3">คลังสินค้า</h6>
          </Row>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            {Object.keys(warehouses).map(key => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)} disabled={!grantBranch}>
                {warehouses[key].warehouseName}
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
        {/* <CardFooter>
          <Button theme="light" onClick={() => setShowWarehouseDetail(true)}>
            <i className="material-icons" style={{ fontSize: 22 }}>
              add
            </i>
          </Button>
        </CardFooter> */}
        {showWarehouseDetail && (
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
                  <Button onClick={() => setShowWarehouseDetail(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{selectedWarehouse.warehouseName}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingWarehouse
                  warehouse={selectedWarehouse}
                  showLocation={() => setShowLocation(true)}
                  onCancel={() => setShowWarehouseDetail(false)}
                />
              </CardBody>
            </Card>
          </Slide>
        )}
        {showLocation && selectedWarehouse && selectedWarehouse.locationId && (
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
                    <h6 style={{ color: theme.colors.accent }}>
                      {locations[selectedWarehouse.locationId].locationName}
                    </h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingLocation
                  location={locations[selectedWarehouse.locationId]}
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
export default WarehouseList;
