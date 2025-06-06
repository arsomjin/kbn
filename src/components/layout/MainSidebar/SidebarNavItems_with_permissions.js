import React, { forwardRef, Fragment } from 'react';
import { Menu } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';
import { DevMenu, ExecMenu } from 'data/Constant';
import { isMobile } from 'react-device-detect';
import { setSelectedKeys } from 'redux/actions/unPersisted';
import { setOpenKeys } from 'redux/actions/unPersisted';
import { showGrantDenied } from 'functions';

const { version } = require('../../../../package.json');

const { SubMenu } = Menu;

const SidebarNavItems = forwardRef((props, ref) => {
  const { navItems: items, selectedKeys, openKeys } = useSelector(state => state.unPersisted);
  const { user } = useSelector(state => state.auth);
  const { theme, version: latestVersion } = useSelector(state => state.global);

  let location = useLocation();
  // showLog('location', location.pathname);

  const mItems = isMobile && !user.isDev ? items.filter(l => l.title !== 'User Manual') : items;

  const ItemsExec = [...mItems.slice(0, mItems.length - 3), ...ExecMenu, ...mItems.slice(mItems.length - 3)];

  const ItemsDev = [...ItemsExec.slice(0, mItems.length), ...DevMenu, ...ItemsExec.slice(mItems.length)];

  const menu_items = user.isDev ? ItemsDev : user.group && user.group === 'group001' ? ItemsExec : mItems;

  const rootSubmenuKeys = [
    '45',
    '61',
    '36',
    '4',
    '23',
    '31',
    '69',
    '77',
    '70',
    '73',
    '114',
    '122',
    '107',
    '96',
    '118',
    '87',
    '85',
    '56',
    '50',
    '41',
    '38'
  ];

  const mainMenuKeys = ['4', '23', '31', '36', '61', '69', '77', '118', '96', '107', '122', '114'];

  // showLog({ selectedKeys, openKeys });

  const dispatch = useDispatch();
  const history = useHistory();

  const handleClick = (e, disabled) => {
    console.log('click ', e);
    if (!disabled) {
      history.push(e.to);
      dispatch(toggleSidebar(false));
    } else {
      showGrantDenied();
    }
  };

  const handleMenuClick = e => {
    // console.log('menu_click ', e);
    dispatch(setSelectedKeys(e.keyPath));
  };

  const onOpenChange = oKeys => {
    //  showLog({ oKeys });
    // dispatch(setOpenKeys(oKeys));
    const latestOpenKey = oKeys.find(key => openKeys.indexOf(key) === -1);
    //  showLog({ latestOpenKey });
    if (mainMenuKeys.indexOf(latestOpenKey) === -1) {
      dispatch(setOpenKeys(oKeys));
    } else {
      dispatch(setOpenKeys(latestOpenKey ? [latestOpenKey] : []));
    }
  };

  const _renderSubItem = (item, header, disabled, idx) => {
    if (typeof item.items !== 'undefined' && item.items.length) {
      // showLog('key', `${header}${item.title}${idx}`);
      if (item.type && item.type === 'group') {
        return (
          <Menu.ItemGroup
            key={item.key || item.title}
            title={
              <span
                style={{
                  fontSize: '14px',
                  ...(disabled && { color: theme.colors.grey3 })
                }}
              >
                {item.title}
              </span>
            }
            style={{ position: 'relative' }}
          >
            {item.items.map((sItem, id) => {
              // showLog('key', `${item.title}${sItem.title}${idx}${id}`);

              let disabled3 = user.isDev
                ? false
                : sItem.permission
                  ? user.permissions
                    ? !user.permissions[sItem.permission]
                    : true
                  : disabled;
              return (
                <Menu.Item onClick={() => handleClick(sItem, disabled3)} key={sItem.key || sItem.title}>
                  <span
                    style={{
                      fontSize: '13px',
                      color: disabled3 ? theme.colors.grey3 : '#546570'
                    }}
                  >
                    {sItem.title}
                  </span>
                </Menu.Item>
              );
            })}
          </Menu.ItemGroup>
        );
      }
      return (
        <SubMenu
          key={item.key || item.title}
          title={
            <span
              style={{
                fontSize: '14px',
                ...(disabled && { color: theme.colors.grey3 })
              }}
            >
              {item.title}
            </span>
          }
          style={{ position: 'relative' }}
        >
          {item.items.map((sItem, id) => {
            // showLog('key', `${item.title}${sItem.title}${idx}${id}`);
            let disabled3 = user.isDev
              ? false
              : sItem.permission
                ? user.permissions
                  ? !user.permissions[sItem.permission]
                  : true
                : disabled;
            return (
              <Menu.Item onClick={() => handleClick(sItem, disabled3)} key={sItem.key || sItem.title}>
                <span
                  style={{
                    fontSize: '13px',
                    color: disabled3 ? theme.colors.grey3 : '#546570'
                  }}
                >
                  {sItem.title}
                </span>
              </Menu.Item>
            );
          })}
        </SubMenu>
      );
    }
    return (
      <Menu.Item key={item.key || item.title} onClick={() => handleClick(item, disabled)}>
        <span
          style={{
            fontSize: '14px',
            ...(disabled && { color: theme.colors.grey3 })
          }}
        >
          {item.title}
        </span>
      </Menu.Item>
    );
  };

  const _renderItem = (item, header, disabled, idx) => {
    if (typeof item.items !== 'undefined' && item.items.length) {
      if (item.type && item.type === 'group') {
        return (
          <Menu.ItemGroup
            key={item.key || item.title}
            title={
              <span
                style={{
                  fontSize: '14px',
                  ...(disabled && { color: theme.colors.grey3 })
                }}
              >
                {item.title}
              </span>
            }
            style={{ position: 'relative' }}
          >
            {item.items.map((sItem, id) => {
              let disabled2 = user.isDev
                ? false
                : sItem.permission
                  ? user.permissions
                    ? !user.permissions[sItem.permission]
                    : true
                  : disabled;
              return _renderSubItem(sItem, item.title, disabled2, `${idx}${id}`);
            })}
          </Menu.ItemGroup>
        );
      }
      return (
        <SubMenu
          key={item.key || item.title}
          title={
            <span
              style={{
                fontSize: '14px',
                ...(disabled && { color: theme.colors.grey3 })
              }}
            >
              {item.title}
            </span>
          }
          style={{ position: 'relative' }}
        >
          {item.items.map((sItem, id) => {
            let disabled2 = user.isDev
              ? false
              : sItem.permission
                ? user.permissions
                  ? !user.permissions[sItem.permission]
                  : true
                : disabled;
            return _renderSubItem(sItem, item.title, disabled2, `${idx}${id}`);
          })}
        </SubMenu>
      );
    }
    return (
      <Menu.Item key={item.key || item.title} onClick={() => handleClick(item, disabled)}>
        <span
          style={{
            fontSize: '14px',
            ...(disabled && { color: theme.colors.grey3 })
          }}
        >
          {item.title}
        </span>
      </Menu.Item>
    );
  };

  return (
    <div className="nav-wrapper">
      <Menu
        onClick={handleMenuClick}
        defaultSelectedKeys={['1']}
        mode="inline"
        onOpenChange={onOpenChange}
        selectedKeys={selectedKeys.length > 0 ? selectedKeys : undefined}
        openKeys={openKeys}
      >
        {menu_items.map((nav, id) => (
          <Fragment key={`${nav.title.toLowerCase()}${id}`}>
            {/* <h6 className="main-sidebar__nav-title border-top">{nav.title}</h6> */}
            {typeof nav.items !== 'undefined' &&
              nav.items.length &&
              nav.items.map((item, idx) => {
                let disabled = user.isDev
                  ? false
                  : item.permCat
                    ? user.permCats
                      ? !user.permCats[item.permCat]
                      : true
                    : false;
                if (typeof item.items !== 'undefined' && item.items.length) {
                  // showLog('key', `${item.title}${id}${idx}`);
                  return (
                    <SubMenu
                      key={item.key || item.title}
                      icon={
                        <div
                          className="d-inline-block item-icon-wrapper"
                          dangerouslySetInnerHTML={{ __html: item.htmlBefore }}
                        />
                      }
                      title={
                        <span
                          style={{
                            fontSize: '14px',
                            ...(disabled && { color: theme.colors.grey3 })
                          }}
                        >
                          {item.title}
                        </span>
                      }
                      style={{ position: 'relative' }}
                    >
                      {item.items.map((sItem, idxx) => _renderItem(sItem, item.title, disabled, `${id}${idx}${idxx}`))}
                    </SubMenu>
                  );
                }
                // showLog('key', `${item.title}${id}${idx}`);
                return (
                  <Menu.Item
                    key={item.key || item.title}
                    onClick={() => handleClick(item, disabled)}
                    icon={
                      <div
                        className="d-inline-block item-icon-wrapper"
                        dangerouslySetInnerHTML={{ __html: item.htmlBefore }}
                      />
                    }
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        ...(disabled && { color: theme.colors.grey3 })
                      }}
                    >
                      {item.title}
                    </span>
                  </Menu.Item>
                );
              })}
          </Fragment>
        ))}
      </Menu>
      <div style={{ height: 100 }} />
      {version !== latestVersion && (
        <div className="m-3 align-items-center">
          <small className="text-danger">มีเวอร์ชั่นใหม่กว่า{'\n'}กรุณาโหลดหน้าเว็บใหม่ เพื่อรับเวอร์ชั่นล่าสุด</small>
        </div>
      )}
      <div className="mb-4" style={{ height: 50 }}>
        <h6 className="main-sidebar__nav-title">{`Version ${version}`}</h6>
      </div>
      {isMobile && <div style={{ height: 50 }} />}
    </div>
  );
});

export default SidebarNavItems;
