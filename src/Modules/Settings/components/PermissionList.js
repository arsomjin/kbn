import React, { useState } from 'react';
import { Container, Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Button, CardFooter } from 'shards-react';
import { Slide } from 'react-awesome-reveal';
import { useSelector } from 'react-redux';

import SettingPermission from './SettingPermission';

const PermissionList = ({ onSelect }) => {
  const { theme } = useSelector(state => state.global);
  const { permissionCategories } = useSelector(state => state.data);

  const [showPermissionDetail, setShowPermissionDetail] = useState(false);
  const [selectedPermissionCategory, setSelectedPermissionCategory] = useState({});

  const _onSelect = key => {
    setSelectedPermissionCategory(permissionCategories[key]);
    setShowPermissionDetail(true);
  };
  return (
    <Container fluid>
      {/* Default Light Table */}
      <Card small className="mb-4">
        <CardHeader className="border-bottom">
          <h6 className="m-0">สิทธิ์การเข้าถึง (หมวด)</h6>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            {Object.keys(permissionCategories).map(key => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)}>
                {permissionCategories[key].permissionCategoryName}
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
        <CardFooter>
          <Button theme="light" onClick={() => setShowPermissionDetail(true)}>
            <i className="material-icons" style={{ fontSize: 22 }}>
              add
            </i>
          </Button>
        </CardFooter>
        {showPermissionDetail && (
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
                  <Button onClick={() => setShowPermissionDetail(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{selectedPermissionCategory.permissionCategoryName}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingPermission
                  permissionCategory={selectedPermissionCategory}
                  onCancel={() => setShowPermissionDetail(false)}
                />
              </CardBody>
            </Card>
          </Slide>
        )}
      </Card>
    </Container>
  );
};
export default PermissionList;
