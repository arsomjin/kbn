import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, ListGroup, ListGroupItem } from 'shards-react';
import { useDispatch, useSelector } from 'react-redux';
import { UploadPhoto } from 'elements';
import { setUsers } from 'redux/actions/data';
import { showWarn, showLog } from 'functions';
import { checkDoc } from 'firebase/api';
import moment from 'moment';

const UserDetails = ({ app, api, selectedUser }) => {
  const { userGroups, users } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [uStatus, setStatus] = useState({});

  const getStatus = async () => {
    try {
      const stateDoc = await checkDoc('status', selectedUser.auth.uid);
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
      const currentUser = app.auth().currentUser;
      if (currentUser && currentUser.uid === selectedUser.uid) {
        await currentUser.updateProfile({ photoURL });
      }
      const userRef = app.firestore().collection('users').doc(selectedUser.uid);
      const docSnap = await userRef.get();
      if (docSnap.exists) {
        await userRef.update({
          auth: {
            ...docSnap.data().auth,
            photoURL
          }
        });
      }

      const updatedUsers = {
        ...users,
        [selectedUser.uid]: { ...users[selectedUser.uid], photoURL }
      };
      dispatch(setUsers(updatedUsers));
      await api.updateData('users');
    } catch (error) {
      showWarn(error);
    }
  };

  const grantUserEdit =
    (user.permissions && user.permissions.permission702) || user.isDev || user.uid === selectedUser.uid;

  return (
    <Card small className="mb-4 pt-3">
      <CardHeader className="border-bottom text-center">
        <div className="mb-3 mx-auto">
          <UploadPhoto
            disabled={!grantUserEdit}
            src={selectedUser.photoURL}
            storeRef={`images/users/${selectedUser.uid}`}
            setUrl={_setPhotoUrl}
          />
        </div>
        <h5 className="mb-0">{selectedUser.displayName}</h5>
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
