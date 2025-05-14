import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { ROLES } from '../constants/roles';
import { getPrivilegeLevel } from '../utils/roleUtils';

interface UseRedirectLogicParams {
  requiresAuth?: boolean;
  requiresProfileComplete?: boolean;
  allowedRoles?: string[];
  minPrivilegeLevel?: string; // e.g., "EDITOR", "ADMIN", etc.
}

/**
 * Centralized hook for route guarding and redirection logic.
 * Returns { loading, redirectPath } for use in route guards.
 */
const useRedirectLogic = ({
  requiresAuth = false,
  requiresProfileComplete = false,
  allowedRoles,
  minPrivilegeLevel
}: UseRedirectLogicParams) => {
  const { isAuthenticated, userProfile, isLoading, hasNoProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Set a very short safety timeout to prevent infinite loading
    // This is just a fallback and should rarely be triggered
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('[useRedirectLogic] Force exiting loading state after timeout');
        setLoading(false);
      }
    }, 1000); // Reduced to 1 second

    // Process auth state as soon as we have enough information
    // Don't wait for isLoading to be false if we can make decisions with current state

    // Early processing for authentication check
    if (requiresAuth && !isAuthenticated && !isLoading) {
      console.log('[useRedirectLogic] Not authenticated, redirecting to /auth/login');
      setLoading(false);
      setRedirectPath('/auth/login');
      return () => clearTimeout(timeoutId);
    }

    // Handle case where we know user is authenticated but has no profile
    if (requiresAuth && isAuthenticated && hasNoProfile && !isLoading) {
      console.log('[useRedirectLogic] No profile, redirecting to /complete-profile');
      setLoading(false);
      setRedirectPath('/complete-profile');
      return () => clearTimeout(timeoutId);
    }

    // Handle case where we know user profile and role
    if (userProfile && !isLoading) {
      // Set loading to false as we have enough information to make decisions
      setLoading(false);

      // Pending role check
      if (userProfile.role === ROLES.PENDING) {
        console.log('[useRedirectLogic] PENDING role, redirecting to /pending');
        setRedirectPath('/pending');
        return () => clearTimeout(timeoutId);
      }

      // Allowed roles check
      if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
        console.log('[useRedirectLogic] Role not allowed, redirecting to /unauthorized');
        setRedirectPath('/unauthorized');
        return () => clearTimeout(timeoutId);
      }

      // Privilege level check
      if (minPrivilegeLevel && getPrivilegeLevel(userProfile.role) < getPrivilegeLevel(minPrivilegeLevel)) {
        console.log('[useRedirectLogic] Insufficient privilege, redirecting to /unauthorized');
        setRedirectPath('/unauthorized');
        return () => clearTimeout(timeoutId);
      }

      // No redirect needed
      setRedirectPath(null);
      console.log('[useRedirectLogic] Access granted, no redirect needed');
      return () => clearTimeout(timeoutId);
    }

    // If we're still loading and can't make a decision yet, wait
    if (isLoading) {
      setLoading(true);
      return () => clearTimeout(timeoutId);
    }

    // Default case - if we reached here and isLoading is false, we should exit loading state
    setLoading(false);

    return () => clearTimeout(timeoutId);
  }, [
    isAuthenticated,
    isLoading,
    userProfile,
    hasNoProfile,
    requiresAuth,
    requiresProfileComplete,
    allowedRoles,
    minPrivilegeLevel
  ]);

  return { loading, redirectPath };
};

export default useRedirectLogic;
