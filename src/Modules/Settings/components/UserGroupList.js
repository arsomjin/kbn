import React, { useState } from 'react';
import { Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Button } from 'shards-react';
import { Slide } from 'react-awesome-reveal';
import { isMobile } from 'react-device-detect';
import { useSelector } from 'react-redux';

import SettingUserGroup from './SettingUserGroup';
import SettingPermission from './SettingPermission';
import { showGrantDenied } from 'functions';

const UserGroupList = ({ onSelect, toggleMain, hideMain }) => {
  const { theme } = useSelector(state => state.global);
  const { user } = useSelector(state => state.auth);
  const { userGroups } = useSelector(state => state.data);
  const [showUserGroupDetail, setShowUserGroupDetail] = useState(false);
  const [showUserGroupPermissions, setShowUserGroupPermissions] = useState(false);
  const [selectedUserGroup, setSelectedUserGroup] = useState({});

  const grantViewUser = user.isDev || (user.permissions && user.permissions.permission613);

  const _onSelect = key => {
    //  showLog('selectedKey', key);
    //  showLog('userGroup', user.group);
    if (key === user.group && key !== 'group001' && !user.isDev) {
      showGrantDenied();
      return;
    }
    if (user?.permissions && !user.permissions?.permission614 && !user.isDev) {
      showGrantDenied();
      return;
    }
    setSelectedUserGroup(userGroups[key]);
    setShowUserGroupDetail(true);
  };

  const _onCancel = () => {
    setShowUserGroupPermissions(false);
  };

  return (
    <Slide triggerOnce direction="right" duration={500}>
      <Card className="mb-4">
        <CardHeader className="border-bottom">
          <Row
            style={{
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            {isMobile && hideMain && (
              <Button onClick={() => toggleMain()} className="btn-white ">
                &larr; กลับ
              </Button>
            )}
            <h6 className="m-0">กลุ่มผู้ใช้งาน</h6>
          </Row>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            {Object.keys(userGroups).map(key => (
              <ListGroupItem key={key} action onClick={() => _onSelect(key)} disabled={!grantViewUser}>
                {userGroups[key].userGroupName}
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
        {/* <CardFooter>
              <Button
                theme="light"
                onClick={() => setShowUserGroupDetail(true)}
              >
                <i className="material-icons" style={{ fontSize: 22 }}>
                  add
                </i>
              </Button>
            </CardFooter> */}
        {showUserGroupDetail && (
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
            childStyle={{ height: '100%' }}
          >
            <Card className="mb-4 d-flex">
              <CardHeader className="border-bottom">
                <Row form style={{ alignItems: 'center' }}>
                  <Button onClick={() => setShowUserGroupDetail(false)} className="btn-white mr-3">
                    &larr; กลับ
                  </Button>
                  <div
                    className="ml-sm-auto mt-2"
                    style={{
                      justifyContent: 'flex-end',
                      marginRight: '10px'
                    }}
                  >
                    <h6 style={{ color: theme.colors.accent }}>{selectedUserGroup.userGroupName}</h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingUserGroup
                  userGroup={selectedUserGroup}
                  onCancel={() => setShowUserGroupDetail(false)}
                  showPermissions={() => setShowUserGroupPermissions(true)}
                />
              </CardBody>
            </Card>
          </Slide>
        )}
        {showUserGroupPermissions && selectedUserGroup && selectedUserGroup.userGroupId && (
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
            <Card className="mb-4 d-flex">
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
                    <h6 style={{ color: theme.colors.accent }}>
                      กำหนดสิทธิ์การเข้าถึงข้อมูล ของกลุ่ม {selectedUserGroup.userGroupName}
                    </h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingPermission userGroup={selectedUserGroup} onCancel={() => _onCancel()} />
              </CardBody>
            </Card>
          </Slide>
        )}
      </Card>
    </Slide>
  );
};
export default UserGroupList;
