import { RoleCategory } from '../../constants/roles';
import { getAllowedRolesByCategory } from '../../utils/roleUtils';

/**
 * Admin routes configuration
 * Only accessible to users with admin roles (system-admin, province-admin, owner, executive, developer)
 */
export const AdminRoutes = [
  <Route
    key="review-users"
    path="review-users"
    element={
      <ProtectedRoute allowedRoles={getAllowedRolesByCategory(RoleCategory.EXECUTIVE)}>
        <UserReview />
      </ProtectedRoute>
    }
  />,
  <Route
    key="review-users"
    path="review-users"
    element={
      <ProtectedRoute allowedRoles={getAllowedRolesByCategory(RoleCategory.EXECUTIVE)}>
        <UserReview />
      </ProtectedRoute>
    }
  />,
];
