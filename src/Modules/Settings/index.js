import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import SettingList from './screens/SettingList';
import { Container, Row, Col } from 'shards-react';
import PageTitle from 'components/common/PageTitle';
import { SettingItems } from 'data/Constant';
import { showLog } from 'functions';
import ProvinceList from './components/ProvinceList';
import BranchList from './components/BranchList';
import VehicleSettings from './components/VehicleSettings';
import PartList from './components/PartList';
import WarehouseList from './components/WarehouseList';
import LocationList from './components/LocationList';
import UserGroupList from './components/UserGroupList';
import PermissionList from './components/PermissionList';
import AccountSettings from './components/AccountSettings';
import PromotionSettings from './components/PromotionSettings';
import ProvinceMigration from './components/ProvinceMigration';
import SystemSettings from './components/SystemSettings';
import { useRouteMatch } from 'react-router-dom';

const Settings = () => {
  const [settingItem, setSettingItem] = useState(SettingItems.branch);
  const [hideMain, setHideMain] = useState(true);
  const [title, setTitle] = useState(SettingItems.branch);

  let match = useRouteMatch();
  showLog('match', match);

  useEffect(() => {
    switch (match.path) {
      case '/setting-branches':
        onSelect(SettingItems.branch);
        setTitle(SettingItems.branch);
        break;
      case '/setting-users':
        onSelect(SettingItems.userGroup);
        setTitle(SettingItems.userGroup);
        break;
      case '/setting-account':
        onSelect(SettingItems.account);
        setTitle(SettingItems.account);
        break;
      case '/setting-vehicles':
        onSelect(SettingItems.vehicles);
        setTitle(SettingItems.vehicles);
        break;
      case '/setting-promotions':
        onSelect(SettingItems.promotions);
        setTitle(SettingItems.promotions);
        break;
      case '/setting-system':
        onSelect(SettingItems.system);
        setTitle(SettingItems.system);
        break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = it => {
    //  showLog('selected', it);
    setSettingItem(it);
    isMobile && setHideMain(true);
  };

  const _showMain = () => {
    setHideMain(false);
  };

  let currentView = <BranchList toggleMain={() => _showMain()} hideMain={hideMain} />;

  switch (settingItem) {
    case SettingItems.province:
      currentView = <ProvinceList toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.branch:
      currentView = <BranchList toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.vehicles:
      currentView = <VehicleSettings toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.parts:
      currentView = <PartList toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.warehouse:
      currentView = <WarehouseList toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.location:
      currentView = <LocationList toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.userGroup:
      currentView = <UserGroupList toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.permission:
      currentView = <PermissionList toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.account:
      currentView = <AccountSettings toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.promotions:
      currentView = <PromotionSettings toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;
    case SettingItems.migration:
      currentView = <ProvinceMigration />;
      break;
    case SettingItems.system:
      currentView = <SystemSettings toggleMain={() => _showMain()} hideMain={hideMain} />;
      break;

    default:
      break;
  }

  return (
    <Container fluid style={{ height: '85vh' }}>
      {/* Page Header */}
      <Row noGutters className="page-header py-4 px-4">
        <PageTitle sm="4" title="การตั้งค่า" subtitle={`Settings - ${title}`} className="text-sm-left" />
      </Row>
      <Row noGutters>
        {!hideMain && (
          <Col md="4" className="px-2">
            <SettingList onSelect={it => onSelect(it)} selected={settingItem} />
          </Col>
        )}
        <Col md="12">{currentView}</Col>
      </Row>
    </Container>
  );
};

export default Settings;
