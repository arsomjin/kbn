import React, { useState } from 'react';
import { Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Button } from 'shards-react';
import { isMobile } from 'react-device-detect';
import { Slide } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';

import SettingLocation from './SettingLocation';
import MainContainer from './MainContainer';

const LocationList = ({ onSelect, toggleMain, hideMain }) => {
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.global);
  const { locations } = useSelector(state => state.data);
  const [showLocationDetail, setShowLocationDetail] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({});

  const grantBranch = user.isDev || (user.permissions && user.permissions.permission601);

  const _onSelect = key => {
    setSelectedLocation(locations[key]);
    setShowLocationDetail(true);
  };

  const _onCancel = () => {
    setShowLocationDetail(false);
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
            <h6 className="m-0 mr-3 ml-3">สถานที่</h6>
          </Row>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            {Object.keys(locations).map(key => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)} disabled={!grantBranch}>
                {locations[key].tambol === 'โคกกรวด' ? locations[key].tambol : locations[key].amphoe}
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
        {/* <CardFooter>
          <Button theme="light" onClick={() => setShowLocationDetail(true)}>
            <i className="material-icons" style={{ fontSize: 22 }}>
              add
            </i>
          </Button>
        </CardFooter> */}
        {showLocationDetail && (
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
                  <Button onClick={() => _onCancel()} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{selectedLocation.amphoe}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingLocation location={selectedLocation} onCancel={() => _onCancel()} />
              </CardBody>
            </Card>
          </Slide>
        )}
      </Card>
    </MainContainer>
  );
};
export default LocationList;
