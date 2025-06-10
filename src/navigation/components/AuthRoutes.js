import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import Auth from 'Modules/Auth';
import ApprovalStatus from 'Modules/Auth/ApprovalStatus';

const AuthRoutes = ({ showApprovalStatus, user }) => {
  // If showing approval status for pending user
  if (showApprovalStatus && user?.isPendingApproval) {
    return (
      <div>
        <Route path="/approval-status" render={() => <ApprovalStatus user={user} />} />
        <Redirect to="/approval-status" from="/" />
      </div>
    );
  }

  // Default auth routes for unauthenticated users
  return (
    <div>
      <Route path="/login" component={Auth} />
      <Redirect exact to="/login" from="/" />
    </div>
  );
};

AuthRoutes.propTypes = {
  showApprovalStatus: PropTypes.bool,
  user: PropTypes.shape({
    isPendingApproval: PropTypes.bool,
    userType: PropTypes.string,
    department: PropTypes.string,
    homeBranch: PropTypes.string,
    homeProvince: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    approvalLevel: PropTypes.string
  })
};

AuthRoutes.defaultProps = {
  showApprovalStatus: false,
  user: null
};

export default AuthRoutes;
