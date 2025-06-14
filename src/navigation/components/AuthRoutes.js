import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import Auth from 'Modules/Auth';
import ApprovalStatus from 'Modules/Auth/ApprovalStatus';

const AuthRoutes = ({ showApprovalStatus, user }) => {
  // If showing approval status for pending user
  // Check actual approval status - prioritize isApproved and isActive over isPendingApproval flag
  // Enhanced check to handle Clean Slate RBAC and rejected users
  const getUserStatus = (user) => {
    if (!user) return { isPending: false, isRejected: false };
    
    // Check for rejection - FIXED: Don't reject immediately after signup
    const isRejected = user.approvalStatus === 'rejected' && 
                      user.rejectedAt && // Must have been explicitly rejected
                      (Date.now() - (user.rejectedAt || 0)) > 60000; // At least 1 minute after rejection
    
    // Check for approval (Clean Slate RBAC or legacy) - FIXED: Don't auto-approve Clean Slate users
    const hasCleanSlateRBAC = !!user.access?.authority;
    const cleanSlateApproved = hasCleanSlateRBAC && user.isApproved === true;
    const cleanSlateActive = hasCleanSlateRBAC && user.isActive === true;
    
    const legacyApproved = user.isApproved === true;
    const legacyActive = user.isActive !== false; // Default to true if not explicitly false
    
    const isApproved = cleanSlateApproved || legacyApproved;
    const isActive = cleanSlateActive || (legacyActive && !hasCleanSlateRBAC); // Legacy only if no Clean Slate
    
    // User is pending if not approved, not active, but also not rejected
    const isPending = (!isApproved || !isActive) && !isRejected;
    
    return { isPending, isRejected, isApproved, isActive };
  };

  const { isPending, isRejected } = getUserStatus(user);
  const shouldShowApprovalStatus = isPending || isRejected;

  if (showApprovalStatus && shouldShowApprovalStatus) {
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
    isApproved: PropTypes.bool,
    isActive: PropTypes.bool,
    approvalStatus: PropTypes.string,
    rejectedAt: PropTypes.number,
    userType: PropTypes.string,
    department: PropTypes.string,
    homeBranch: PropTypes.string,
    homeProvince: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    approvalLevel: PropTypes.string,
    access: PropTypes.shape({
      authority: PropTypes.string,
      departments: PropTypes.array,
      geographic: PropTypes.object
    })
  })
};

AuthRoutes.defaultProps = {
  showApprovalStatus: false,
  user: null
};

export default AuthRoutes;
