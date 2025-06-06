import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Row, Card, CardHeader, CardBody, ListGroup, ListGroupItem, Button } from 'shards-react';
import { Slide } from 'react-awesome-reveal';

import { useSelector } from 'react-redux';

import SettingProvince from './SettingProvince';
import BranchList from './BranchList';
import MainContainer from './MainContainer';
import { FirebaseContext } from '../../../firebase';
import { usePermissions } from '../../../hooks/usePermissions';

const ProvinceList = ({ onSelect, toggleMain, hideMain }) => {
  const { api } = useContext(FirebaseContext);

  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.global);
  const { provinces = {} } = useSelector(state => state.data);
  const { hasPermission, getAccessibleProvinces } = usePermissions();
  
  const [showProvinceDetail, setShowProvinceDetail] = useState(false);
  const [showBranchList, setShowBranchList] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState({});

  const grantProvince = user.isDev || hasPermission('manage_provinces') || (user.permissions && user.permissions.permission601);

  useEffect(() => {
    api.getProvinces();
    api.getBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accessibleProvinces = getAccessibleProvinces(provinces);

  const _onSelect = key => {
    setSelectedProvince(accessibleProvinces[key]);
    setShowProvinceDetail(true);
  };

  const _add = useCallback(() => {
    setSelectedProvince({});
    setShowProvinceDetail(true);
  }, []);

  const _showBranches = useCallback((province) => {
    setSelectedProvince(province);
    setShowBranchList(true);
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
            <h6 className="m-0 mr-3 ml-3">จังหวัด</h6>
            {grantProvince && (
              <Button theme="accent" size="sm" className="mr-3" onClick={_add}>
                <i className="material-icons" style={{ fontSize: 16, marginRight: 4 }}>
                  add
                </i>
                เพิ่มจังหวัด
              </Button>
            )}
          </Row>
        </CardHeader>
        <CardBody className="p-0 pb-3">
          <ListGroup>
            {Object.keys(accessibleProvinces).map(key => {
              const province = accessibleProvinces[key];
              return (
                <ListGroupItem key={key} className="d-flex justify-content-between align-items-center">
                  <div 
                    onClick={() => _onSelect(key)} 
                    style={{ cursor: grantProvince ? 'pointer' : 'default', flex: 1 }}
                  >
                    <div>
                      <strong>{province.provinceName}</strong>
                      <span className="text-muted ml-2">({province.region})</span>
                    </div>
                    <small className="text-muted">
                      {province.branches ? province.branches.length : 0} สาขา
                      {!province.isActive && <span className="text-danger ml-2">• ปิดใช้งาน</span>}
                    </small>
                  </div>
                  <div>
                    <Button 
                      size="sm" 
                      theme="light" 
                      className="mr-2"
                      onClick={() => _showBranches(province)}
                    >
                      สาขา
                    </Button>
                    {grantProvince && (
                      <Button 
                        size="sm" 
                        theme="outline-secondary"
                        onClick={() => _onSelect(key)}
                      >
                        จัดการ
                      </Button>
                    )}
                  </div>
                </ListGroupItem>
              );
            })}
            {Object.keys(accessibleProvinces).length === 0 && (
              <ListGroupItem className="text-center text-muted py-4">
                ไม่มีข้อมูลจังหวัด
              </ListGroupItem>
            )}
          </ListGroup>
        </CardBody>

        {showProvinceDetail && (
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
            }}
          >
            <Card small className="mb-4 d-flex">
              <CardHeader className="border-bottom">
                <Row form style={{ alignItems: 'center' }}>
                  <Button onClick={() => setShowProvinceDetail(false)} className="btn-white mr-3">
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
                      {selectedProvince.provinceName || 'จังหวัดใหม่'}
                    </h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <SettingProvince
                  province={selectedProvince}
                  onCancel={() => setShowProvinceDetail(false)}
                  showBranches={() => _showBranches(selectedProvince)}
                />
              </CardBody>
            </Card>
          </Slide>
        )}

        {showBranchList && selectedProvince && (
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
            }}
          >
            <Card small className="mb-4 d-flex">
              <CardHeader className="border-bottom">
                <Row form style={{ alignItems: 'center' }}>
                  <Button onClick={() => setShowBranchList(false)} className="btn-white mr-3">
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
                      สาขาใน{selectedProvince.provinceName}
                    </h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <BranchList 
                  provinceFilter={selectedProvince.provinceName}
                  onSelect={onSelect}
                  toggleMain={() => setShowBranchList(false)}
                  hideMain={true}
                />
              </CardBody>
            </Card>
          </Slide>
        )}
      </Card>
    </MainContainer>
  );
};

export default ProvinceList; 