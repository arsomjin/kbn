import { FirebaseContext } from '../../../../firebase';
import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { logoutUser } from 'redux/actions/auth';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Collapse, NavItem, NavLink } from 'shards-react';

const UserActions = () => {
  const { app } = useContext(FirebaseContext);
  const { isLoggingOut, logoutError, user } = useSelector(state => state.auth);
  const [visible, setVisible] = useState(false);
  const history = useHistory();

  const dispatch = useDispatch();
  const handleLogout = () => {
    // Update state & Log out.
    let updateStateRef = app.firestore().collection('status').doc(user.uid);
    updateStateRef.get().then(doc => {
      if (doc.exists) {
        updateStateRef.update({ state: 'offline', last_offline: Date.now() }).then(() => dispatch(logoutUser()));
      } else {
        dispatch(logoutUser());
      }
    });
  };

  const toggleUserActions = () => {
    setVisible(pVisible => !pVisible);
  };

  const isMe = user.email && user.email === 'arsom@happyinnovation.net';

  const DisplayName = isMe
    ? 'Happy Innovation'
    : user.displayName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email);

  const DisplayAvatar = isMe
    ? require('../../../../images/avatars/happyInnovation.png')
    : user.photoURL || require('../../../../images/avatars/blank-profile.png');

  const _onClick = path => {
    history.push(path);
  };

  return (
    <NavItem tag={Dropdown} caret toggle={() => toggleUserActions()}>
      <DropdownToggle caret tag={NavLink} className="text-nowrap px-3">
        <img
          className="user-avatar rounded-circle mr-2"
          src={DisplayAvatar}
          alt="User Avatar"
          style={{ objectFit: 'fill', height: 40, width: 40 }}
        />{' '}
        <span className="d-none d-md-inline-block">{DisplayName}</span>
      </DropdownToggle>
      <Collapse tag={DropdownMenu} right small open={visible}>
        <DropdownItem onClick={() => _onClick('/user-profile')}>
          <i className="material-icons">&#xE7FD;</i> ข้อมูลส่วนตัว
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="text-danger" onClick={() => handleLogout()}>
          <i className="material-icons text-danger">&#xE879;</i> ออกจากระบบ
          {isLoggingOut && <p>Logging Out....</p>}
          {logoutError && <p>Error logging out</p>}
        </DropdownItem>
      </Collapse>
    </NavItem>
  );
};

export default UserActions;
