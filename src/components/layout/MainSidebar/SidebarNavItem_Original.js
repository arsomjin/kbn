import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { NavLink as RouteNavLink } from 'react-router-dom';
import { NavItem, NavLink, DropdownMenu, DropdownItem, Collapse } from 'shards-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebarDropdown } from 'redux/actions/unPersisted';
import { toggleSidebar } from 'redux/actions/unPersisted';

const SidebarNavItem = forwardRef(({ item }, ref) => {
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.global);

  const dispatch = useDispatch();

  const toggleDropdown = (item, hasSubItems) => {
    dispatch(toggleSidebarDropdown(item));
    !hasSubItems && dispatch(toggleSidebar(false));
  };

  const hasSubItems = item.items && item.items.length;

  let disabled = user.isDev ? false : item.permCat ? (user.permCats ? !user.permCats[item.permCat] : true) : false;

  return (
    <NavItem style={{ position: 'relative' }}>
      <NavLink
        className={hasSubItems && 'dropdown-toggle'}
        tag={hasSubItems ? 'a' : RouteNavLink}
        to={hasSubItems ? '#' : item.to}
        onClick={() => toggleDropdown(item, hasSubItems)}
        disabled={disabled}
      >
        {item.htmlBefore && (
          <div className="d-inline-block item-icon-wrapper" dangerouslySetInnerHTML={{ __html: item.htmlBefore }} />
        )}
        {item.title && (
          <span
            style={{
              fontSize: '16px',
              ...(disabled && { color: theme.colors.grey3 })
            }}
          >
            {item.title}
          </span>
        )}
        {item.htmlAfter && (
          <div className="d-inline-block item-icon-wrapper" dangerouslySetInnerHTML={{ __html: item.htmlAfter }} />
        )}
      </NavLink>
      {hasSubItems && (
        <Collapse tag={DropdownMenu} small open={item.open} style={{ top: 0 }}>
          {item.items.map((subItem, idx) => (
            <DropdownItem
              key={idx}
              tag={RouteNavLink}
              to={subItem.to}
              onClick={() => dispatch(toggleSidebar(false))}
              disabled={disabled}
            >
              {subItem.title}
            </DropdownItem>
          ))}
        </Collapse>
      )}
    </NavItem>
  );
});

SidebarNavItem.propTypes = {
  /**
   * The item object.
   */
  item: PropTypes.object
};

export default SidebarNavItem;
