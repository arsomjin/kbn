import React, { useCallback, useEffect } from 'react';

import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { getCurrentDevice } from 'functions';
import { useDispatch, useSelector } from 'react-redux';
import { updateDevice } from 'redux/actions/global';

// Essential styles imports - BASE LIBRARIES
import 'antd/dist/antd.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'shards-ui/dist/css/shards.min.css';

// UNIFIED THEME SYSTEM - MASTER CONTROLLER (loads after base libraries)
import 'styles/unified-theme.css';

// Legacy theme styles (gradually being replaced by unified system)
import 'styles/nature-theme.scss';
import 'styles/nature-components.css';
import 'styles/nature-antd-overrides.css';
import 'styles/nature-login.css';
import 'styles/nature-enhancement.css';
import 'styles/font-config.css';

// // Additional styles
import 'styles/print.css';
import 'styles/network-status.css';
import 'styles/mobile-overflow-fix.css';

import { PrivateRoutes } from './components/PrivateRoutes';
import AuthRoutes from './components/AuthRoutes';
import FirebaseProvider from '../firebase';
import Load from 'elements/Load';

export const NotFoundRedirect = () => <Redirect to="/not-found" />;

const Navigation = () => {
  const { isAuthenticated, isLoggingOut, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const _getDevice = useCallback(() => {
    const device = getCurrentDevice();
    dispatch(updateDevice(device));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine user approval status with Clean Slate RBAC support
  const getUserApprovalStatus = (user) => {
    if (!user) return { isApproved: false, isActive: false, isRejected: false };
    
    // Clean Slate RBAC: Check if user has access structure (but this doesn't mean approved!)
    const hasCleanSlateRBAC = !!user.access?.authority;
    
    // FIXED: Clean Slate users must STILL check actual approval status
    const cleanSlateApproved = hasCleanSlateRBAC && user.isApproved === true;
    const cleanSlateActive = hasCleanSlateRBAC && user.isActive === true;
    
    // Legacy approval fields
    const legacyApproved = user.isApproved === true;
    const legacyActive = user.isActive !== false; // Default to true if not explicitly false
    
    // FIXED: Only consider explicitly rejected users as rejected
    // Don't flag new pending users as rejected
    const isRejected = user.approvalStatus === 'rejected' && 
                      user.rejectedAt && // Must have been explicitly rejected
                      (Date.now() - (user.rejectedAt || 0)) > 60000; // At least 1 minute after rejection
    
    // Determine final approval status - FIXED: Don't auto-approve Clean Slate users
    const isApproved = cleanSlateApproved || legacyApproved;
    const isActive = cleanSlateActive || (legacyActive && !hasCleanSlateRBAC); // Legacy only if no Clean Slate
    
    console.log('🔍 Navigation - User Approval Check:', {
      uid: user.uid,
      hasCleanSlateRBAC,
      legacyApproved,
      legacyActive,
      isRejected,
      finalApproved: isApproved,
      finalActive: isActive,
      shouldShowApproval: !isApproved || !isActive || isRejected
    });
    
    return { isApproved, isActive, isRejected };
  };

  useEffect(() => {
    // showLog('navigation_auth', isAuthenticated);
    // Disable right click.
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    // Get device info.
    _getDevice();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate approval status
  const { isApproved, isActive, isRejected } = getUserApprovalStatus(user);
  const shouldShowApprovalStatus = !isApproved || !isActive || isRejected;

  console.log('🔍 Navigation - Routing Decision:', {
    isAuthenticated,
    isLoggingOut,
    shouldShowApprovalStatus,
    userUID: user?.uid,
    routingTo: !isAuthenticated ? 'AuthRoutes' : 
               isLoggingOut ? 'Loading' : 
               shouldShowApprovalStatus ? 'AuthRoutes (Approval)' : 'PrivateRoutes'
  });

  return (
    <FirebaseProvider>
      <Router basename={(typeof process !== 'undefined' && process.env?.REACT_APP_BASENAME) || ''}>
        <Switch>
          {!isAuthenticated ? (
            <AuthRoutes />
          ) : isLoggingOut ? ( // Avoid Firebase PERMISSION_DENIED ISSUE.
            <Load loading />
          ) : shouldShowApprovalStatus ? ( // Show approval status for pending/rejected users
            <AuthRoutes showApprovalStatus={true} user={user} />
          ) : (
            <PrivateRoutes />
          )}
          {/* Removed catch-all NotFoundRedirect - let PrivateRoutes handle routing */}
        </Switch>
      </Router>
    </FirebaseProvider>
  );
};

Navigation.displayName = 'Navigation';
export default Navigation;
