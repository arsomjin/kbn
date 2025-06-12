import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'shards-react';

import PageTitle from 'components/common/PageTitle';
import UserDetails from './UserDetails';
import UserAccountDetails from './UserAccountDetails';
import { showLog } from 'functions';
import { validateUserStructure } from 'utils/user-structure-safety';

const UserProfile = ({ onCancel, app, api, selectedUser }) => {
  // Validate user structure and log any issues
  const validation = validateUserStructure(selectedUser);
  
  if (process.env.NODE_ENV === 'development') {
    showLog({ selectedUser, validation });
    
    if (!validation.isValid) {
      console.warn('🚨 UserProfile: User structure issues detected:', validation.issues);
      validation.recommendations.forEach(rec => console.warn(`💡 ${rec}`));
    }
  }
  
  return (
    <div className="px-3">
      <Row noGutters className="page-header my-3">
        <PageTitle title="User Profile" subtitle="Overview" md="12" />
      </Row>
      <Row>
        <Col lg="4">
          <UserDetails app={app} api={api} selectedUser={selectedUser} />
        </Col>
        <Col lg="8">
          <UserAccountDetails app={app} api={api} selectedUser={selectedUser} onCancel={onCancel} />
        </Col>
      </Row>
    </div>
  );
};

UserProfile.propTypes = {
  onCancel: PropTypes.func.isRequired,
  app: PropTypes.shape({
    auth: PropTypes.func.isRequired,
    firestore: PropTypes.func.isRequired
  }).isRequired,
  api: PropTypes.shape({
    updateData: PropTypes.func.isRequired
  }).isRequired,
  selectedUser: PropTypes.shape({
    uid: PropTypes.string,
    displayName: PropTypes.string,
    auth: PropTypes.shape({
      uid: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      phoneNumber: PropTypes.string
    }),
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    _key: PropTypes.string
  }).isRequired
};

export default UserProfile;
