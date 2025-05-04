import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import { ROLES, isInRoleCategory, RoleCategory } from '../constants/roles';
import { PERMISSIONS } from '../constants/Permissions';
import { getPrivilegeLevel } from '../utils/roleUtils';

interface UseRedirectLogicParams {
  requiresAuth?: boolean;
  requiresProfileComplete?: boolean;
  allowedRoles?: string[];
  minPrivilegeLevel?: string; // e.g., 'EDITOR', 'ADMIN', etc.
}

/**
 * Centralized hook for route guarding and redirection logic.
 * Returns { loading, redirectPath } for use in route guards.
 */
const useRedirectLogic = ({
  requiresAuth = false,
  requiresProfileComplete = false,
  allowedRoles,
  minPrivilegeLevel,
}: UseRedirectLogicParams) => {
  const { isAuthenticated, userProfile, isLoading, hasNoProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Wait for loading to finish
    if (isLoading) {
      setLoading(true);
      return;
    }
    setLoading(false);

    console.log('[useRedirectLogic] isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'userProfile:', userProfile, 'hasNoProfile:', hasNoProfile, 'requiresAuth:', requiresAuth, 'requiresProfileComplete:', requiresProfileComplete, 'allowedRoles:', allowedRoles, 'minPrivilegeLevel:', minPrivilegeLevel);

    // 1. Auth check
    if (requiresAuth && !isAuthenticated) {
      console.log('[useRedirectLogic] Redirecting to /login');
      setRedirectPath('/login');
      return;
    }

    // 2. Profile completion check
    if (requiresProfileComplete && hasNoProfile) {
      console.log('[useRedirectLogic] Redirecting to /create-profile');
      setRedirectPath('/create-profile');
      return;
    }

    // 3. Pending role check
    if (userProfile?.role === ROLES.PENDING) {
      console.log('[useRedirectLogic] Redirecting to /pending, userProfile.role:', userProfile?.role);
      setRedirectPath('/pending');
      return;
    }

    // 4. Allowed roles check
    if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
      console.log('[useRedirectLogic] Redirecting to /unauthorized, userProfile.role:', userProfile?.role, 'allowedRoles:', allowedRoles);
      setRedirectPath('/unauthorized');
      return;
    }

    // 5. Privilege level check (using roleUtils)
    if (minPrivilegeLevel && userProfile) {
      if (
        getPrivilegeLevel(userProfile.role) < getPrivilegeLevel(minPrivilegeLevel)
      ) {
        console.log('[useRedirectLogic] Redirecting to /unauthorized, userProfile.role:', userProfile?.role, 'minPrivilegeLevel:', minPrivilegeLevel);
        setRedirectPath('/unauthorized');
        return;
      }
    }

    // No redirect needed
    setRedirectPath(null);
    console.log('[useRedirectLogic] No redirect needed, userProfile.role:', userProfile?.role);
  }, [isAuthenticated, isLoading, userProfile, hasNoProfile, requiresAuth, requiresProfileComplete, allowedRoles, minPrivilegeLevel]);

  return { loading, redirectPath };
};

export default useRedirectLogic;
