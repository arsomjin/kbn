import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Col } from 'shards-react';
import { useSelector } from 'react-redux';

import SidebarMainNavbar from './SidebarMainNavbar';
import SidebarSearch from './SidebarSearch';
import SidebarNavItems from './SidebarNavItems';
import EnhancedSidebarNavItems from './EnhancedSidebarNavItems';
import 'styles/enhanced-navigation.css';

const MainSidebar = forwardRef((props, ref) => {
  const { menuVisible } = useSelector(state => state.unPersisted);

  const classes = classNames('main-sidebar', 'px-0', 'col-12', menuVisible && 'open');

  return (
    <Col tag="aside" className={classes} lg={{ size: 2 }} md={{ size: 3 }}>
      <SidebarMainNavbar hideLogoText={props.hideLogoText} />
      <SidebarSearch />
      <div>
        {/* Enhanced RBAC Navigation */}
        <EnhancedSidebarNavItems />
        
        {/* Fallback to original navigation if needed */}
        {/* <SidebarNavItems /> */}
      </div>
    </Col>
  );
});

MainSidebar.displayName = 'MainSidebar';

MainSidebar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool
};

MainSidebar.defaultProps = {
  hideLogoText: false
};

export default MainSidebar;
