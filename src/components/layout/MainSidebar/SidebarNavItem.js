import React, { forwardRef, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { useSelector } from 'react-redux';
const { SubMenu } = Menu;

const SidebarNavItem = forwardRef(({ item, handleClick }, ref) => {
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.global);

  const hasSubItems = it => typeof it.items !== 'undefined' && it.items.length;
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  let disabled = user.isDev ? false : item.permCat ? (user.permCats ? !user.permCats[item.permCat] : true) : false;

  if (!isMountedRef.current) return;

  if (typeof item.items !== 'undefined' && item.items.length) {
    return (
      <>
        <SubMenu
          key={item.key || item.title}
          icon={
            <div
              className="d-inline-block item-icon-wrapper mr-2"
              dangerouslySetInnerHTML={{ __html: item.htmlBefore }}
            />
          }
          title={
            <span
              style={{
                fontSize: '17px',
                ...(disabled && { color: theme.colors.grey3 })
              }}
            >
              {item.title}
            </span>
          }
          style={{ position: 'relative' }}
        >
          {item.items.map((sItem, idx) => {
            if (typeof sItem.items !== 'undefined' && sItem.items.length) {
              if (sItem.type && sItem.type === 'group') {
                return (
                  <Menu.ItemGroup
                    key={sItem.key || sItem.title}
                    title={
                      <span
                        style={{
                          fontSize: '16px',
                          ...(disabled && {
                            color: theme.colors.grey3
                          })
                        }}
                      >
                        {sItem.title}
                      </span>
                    }
                    style={{ position: 'relative' }}
                  >
                    {sItem.items.map((ssItem, idx) => (
                      <Menu.Item
                        onClick={() => {
                          if (!isMountedRef.current) return;
                          handleClick(ssItem);
                        }}
                        key={ssItem.key || ssItem.title}
                      >
                        <span
                          style={{
                            fontSize: '15px',
                            ...(disabled && {
                              color: theme.colors.grey3
                            })
                          }}
                        >
                          {ssItem.title}
                        </span>
                      </Menu.Item>
                    ))}
                  </Menu.ItemGroup>
                );
              }
              return (
                <SubMenu
                  key={sItem.key || sItem.title}
                  title={
                    <span
                      style={{
                        fontSize: '16px',
                        ...(disabled && {
                          color: theme.colors.grey3
                        })
                      }}
                    >
                      {sItem.title}
                    </span>
                  }
                  style={{ position: 'relative' }}
                >
                  {sItem.items.map((ssItem, idx) => (
                    <Menu.Item
                      onClick={() => {
                        if (!isMountedRef.current) return;
                        handleClick(ssItem);
                      }}
                      key={ssItem.key || ssItem.title}
                    >
                      <span
                        style={{
                          fontSize: '15px',
                          ...(disabled && {
                            color: theme.colors.grey3
                          })
                        }}
                      >
                        {ssItem.title}
                      </span>
                    </Menu.Item>
                  ))}
                </SubMenu>
              );
            }
            return (
              <Menu.Item
                key={sItem.key || sItem.title}
                onClick={() => {
                  if (!isMountedRef.current) return;
                  handleClick(sItem);
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    ...(disabled && { color: theme.colors.grey3 })
                  }}
                >
                  {sItem.title}
                </span>
              </Menu.Item>
            );
          })}
        </SubMenu>
      </>
    );
  }
  return (
    <Menu.Item
      key={item.key || item.title}
      onClick={() => {
        if (!isMountedRef.current) return;
        handleClick(item);
      }}
      icon={
        <div className="d-inline-block item-icon-wrapper mr-2" dangerouslySetInnerHTML={{ __html: item.htmlBefore }} />
      }
    >
      <span
        style={{
          fontSize: '17px',
          ...(disabled && { color: theme.colors.grey3 })
        }}
      >
        {item.title}
      </span>
    </Menu.Item>
  );
});

SidebarNavItem.propTypes = {
  /**
   * The item object.
   */
  item: PropTypes.object
};

export default SidebarNavItem;
