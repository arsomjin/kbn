import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'shards-react';

import { SettingItems } from 'data/Constant';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { showLog } from 'functions';

const SettingList = ({ onSelect, selected }) => {
  const { user } = useSelector(state => state.auth);

  let match = useRouteMatch();
  showLog('match', match);

  const grantBranch = user.isDev || (user.permissions && user.permissions.permission601);
  const grantViewUser = user.isDev || (user.permissions && user.permissions.permission613);
  const grantProvince = user.isDev || (user.permissions && user.permissions.permission601); // Same as branch for now

  const _onSelect = it => {
    onSelect(it);
  };
  return (
    <Card small className="mb-4">
      {match.path === '/setting-branches' && (
        <Fragment>
          <CardHeader className="border-bottom">
            <h6 className="m-0">สาขาและจังหวัด</h6>
          </CardHeader>
          <CardBody className="p-0 pb-3">
            <ListGroup>
              <ListGroupItem
                action
                active={selected === SettingItems.province}
                onClick={() => _onSelect(SettingItems.province)}
                disabled={!grantProvince}
              >
                จังหวัด
              </ListGroupItem>
              <ListGroupItem
                action
                active={selected === SettingItems.branch}
                onClick={() => _onSelect(SettingItems.branch)}
                disabled={!grantBranch}
              >
                สาขา
              </ListGroupItem>
              <ListGroupItem
                action
                active={selected === SettingItems.migration}
                onClick={() => _onSelect(SettingItems.migration)}
                disabled={!grantProvince}
              >
                การย้ายข้อมูล
              </ListGroupItem>
              <ListGroupItem
                data-id="Dapibus"
                action
                active={selected === SettingItems.warehouse}
                onClick={() => _onSelect(SettingItems.warehouse)}
                disabled={!grantBranch}
              >
                คลังสินค้า
              </ListGroupItem>
              <ListGroupItem
                action
                active={selected === SettingItems.location}
                onClick={() => _onSelect(SettingItems.location)}
                disabled={!grantBranch}
              >
                สถานที่
              </ListGroupItem>
            </ListGroup>
          </CardBody>
        </Fragment>
      )}
      {match.path === '/setting-users' && (
        <Fragment>
          <CardHeader className="border-bottom">
            <h6 className="m-0">กลุ่มผู้ใช้งาน</h6>
          </CardHeader>
          <CardBody className="p-0 pb-3">
            <ListGroup>
              <ListGroupItem
                action
                active={selected === SettingItems.userGroup}
                onClick={() => _onSelect(SettingItems.userGroup)}
                disabled={!grantViewUser}
              >
                กลุ่มผู้ใช้งาน
              </ListGroupItem>
              {/* <ListGroupItem
                  action
                  active={selected === SettingItems.permission}
                  onClick={() => _onSelect(SettingItems.permission)}
                >
                  สิทธิ์การเข้าถึง
                </ListGroupItem> */}
            </ListGroup>
          </CardBody>
        </Fragment>
      )}
      {/* <CardHeader className="border-bottom">
          <h6 className="m-0">รถและอะไหล่</h6>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            <ListGroupItem
              data-id="Dapibus"
              action
              active={selected === SettingItems.vehicles}
              onClick={() => _onSelect(SettingItems.vehicles)}
            >
              รถแทรคเตอร์
            </ListGroupItem>
            <ListGroupItem
              action
              active={selected === SettingItems.parts}
              onClick={() => _onSelect(SettingItems.parts)}
            >
              อะไหล่
            </ListGroupItem>
          </ListGroup>
        </CardBody> */}
    </Card>
  );
};

export default SettingList;
