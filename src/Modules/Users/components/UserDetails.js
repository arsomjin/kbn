import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, ListGroup, ListGroupItem } from 'shards-react';
import { useDispatch, useSelector } from 'react-redux';
import { UploadPhoto } from 'elements';
import { setUsers } from 'redux/actions/data';
import { showWarn, showLog } from 'functions';
import { checkDoc } from 'firebase/api';
import moment from 'moment';
import { getUserId, getUserDisplayName, safeUserUpdate } from 'utils/user-structure-safety';

const UserDetails = ({ app, api, selectedUser }) => {
  const { userGroups, users } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [uStatus, setStatus] = useState({});

  const getStatus = async () => {
    try {
      // Use safety utility to get user ID
      const userId = getUserId(selectedUser);
      
      if (!userId) {
        console.error('UserDetails: Cannot determine user ID from selectedUser structure');
        return;
      }
      
      const stateDoc = await checkDoc('status', userId);
      if (stateDoc) {
        setStatus(stateDoc.data());
      }
    } catch (error) {
      showWarn(error);
    }
  };

  useEffect(() => {
    getStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  useEffect(() => {
    showLog({
      uStatus,
      lastSeen: uStatus?.lastActive || uStatus?.last_online,
      lastActive: moment(uStatus?.lastActive || uStatus?.last_online).format('llll'),
      fromNow: moment(uStatus?.lastActive || uStatus?.last_online).fromNow()
    });
  }, [uStatus]);

  const _setPhotoUrl = async photoURL => {
    try {
      // Use safety utility to get user ID
      const userId = getUserId(selectedUser);
      
      if (!userId) {
        console.error('UserDetails: Cannot determine user ID for photo update');
        showWarn('Cannot identify user for photo update');
        return;
      }
      
      const currentUser = app.auth().currentUser;
      if (currentUser && currentUser.uid === userId) {
        await currentUser.updateProfile({ photoURL });
      }
      
      const userRef = app.firestore().collection('users').doc(userId);
      
      // Use safe update utility to prevent Firestore corruption
      await safeUserUpdate(userRef, { photoURL });

      // Note: Redux state will be automatically updated by the real-time listener
      // No need to manually dispatch or refresh cache - the Firestore listener handles this
    } catch (error) {
      console.error('UserDetails: Error updating photo URL:', error);
      showWarn(error);
    }
  };

  // Use safety utility for permissions check
  const selectedUserId = getUserId(selectedUser);
  const grantUserEdit =
    (user.permissions && user.permissions.permission702) || user.isDev || user.uid === selectedUserId;

  return (
    <Card small className="mb-4 pt-3">
      <CardHeader className="border-bottom text-center">
        <div className="mb-3 mx-auto">
          <UploadPhoto
            disabled={!grantUserEdit}
            src={selectedUser.photoURL}
            storeRef={`images/users/${selectedUserId}`}
            setUrl={_setPhotoUrl}
          />
        </div>
        <h5 className="mb-0">{getUserDisplayName(selectedUser)}</h5>
        {selectedUser.group && (
          <span className="text-muted d-block mb-2">
            {selectedUser.jobTitle || userGroups[selectedUser.group].userGroupName}
          </span>
        )}
        {(uStatus?.lastActive || uStatus?.last_online) && (
          <span className="text-muted d-block mb-2">
            Last active: {moment(uStatus?.lastActive || uStatus?.last_online).fromNow()}
          </span>
        )}
      </CardHeader>
      <ListGroup flush>
        {selectedUser.description && (
          <ListGroupItem className="p-4">
            <strong className="text-muted d-block mb-2">Description</strong>
            <span>{selectedUser.description}</span>
          </ListGroupItem>
        )}
      </ListGroup>
    </Card>
  );
};

UserDetails.propTypes = {
  app: PropTypes.shape({
    auth: PropTypes.func.isRequired,
    firestore: PropTypes.func.isRequired
  }).isRequired,
  api: PropTypes.shape({
    updateData: PropTypes.func.isRequired
  }).isRequired,
  selectedUser: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string,
    auth: PropTypes.shape({
      uid: PropTypes.string.isRequired
    }).isRequired,
    group: PropTypes.string,
    jobTitle: PropTypes.string,
    description: PropTypes.string
  }).isRequired
};

export default UserDetails;
