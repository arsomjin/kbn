import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Navbar, NavbarBrand, CardSubtitle, Row } from 'shards-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';

const SidebarMainNavbar = props => {
  const { menuVisible } = useSelector(state => state.unPersisted);
  const dispatch = useDispatch();
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar(!menuVisible));
  };

  return (
    <div className="main-navbar">
      <Navbar className="align-items-stretch bg-white flex-md-nowrap border-bottom p-0" type="light">
        <NavbarBrand className="w-100 mr-0" href="#" style={{ lineHeight: '25px' }}>
          <div className="d-table m-auto">
            <img
              id="main-logo"
              className="d-inline-block align-top mr-1"
              style={{ maxWidth: '38px', size: '32px' }}
              src={require('../../../images/logo192.png')}
              alt="Kubota Benjapol"
            />
            {!menuVisible && (
              // {!props.hideLogoText && (
              <Fragment>
                <span className="d-none d-md-inline ml-1" style={{ fontSize: '18px' }}>
                  คูโบต้าเบญจพล
                </span>
                <Row
                  style={{
                    justifyContent: 'flex-end',
                    padding: '5px',
                    paddingRight: '16px'
                  }}
                >
                  <CardSubtitle style={{ fontSize: '14px', fontWeight: '300' }}>นครราชสีมา</CardSubtitle>
                </Row>
              </Fragment>
            )}
          </div>
        </NavbarBrand>
        {/* eslint-disable-next-line */}
        <a className="toggle-sidebar d-sm-inline d-md-none d-lg-none" onClick={() => handleToggleSidebar()}>
          <i className="material-icons">&#xE5C4;</i>
        </a>
      </Navbar>
    </div>
  );
};

SidebarMainNavbar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool
};

SidebarMainNavbar.defaultProps = {
  hideLogoText: false
};

export default SidebarMainNavbar;
