import { FirebaseContext } from '../../firebase';
import React, { forwardRef, memo, useContext } from 'react';
import { useSelector } from 'react-redux';
import UserProfile from 'Modules/Users/components/UserProfile';

const Profile = forwardRef((props, ref) => {
  const { app, api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);

  return (
    <UserProfile
      selectedUser={user}
      //   onCancel={() => setShowUserDetail(false)}
      onCancel={() => props.history.goBack()}
      app={app}
      api={api}
    />
  );
});

export default memo(Profile);
