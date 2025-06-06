import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from 'redux/actions/unPersisted';

const NavbarToggle = props => {
  const { menuVisible } = useSelector(state => state.unPersisted);
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(toggleSidebar(!menuVisible));
  };

  return (
    <nav className="nav">
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        href="#"
        onClick={() => handleClick()}
        className="nav-link nav-link-icon toggle-sidebar d-sm-inline d-md-inline d-lg-none text-center"
      >
        <i className="material-icons">&#xE5D2;</i>
      </a>
    </nav>
  );
};

export default NavbarToggle;
