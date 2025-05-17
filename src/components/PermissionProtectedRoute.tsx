import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";
import { PermissionValue } from "../constants/Permissions";
import { hasPermission } from "../utils/permissions";

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: PermissionValue;
  provinceCheck?: () => boolean;
}

/**
 * Route component that checks for required permissions
 */
export const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({
  children,
  requiredPermission,
  provinceCheck
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Check if user has required permission
  const hasAccess = hasPermission(requiredPermission);

  // Check province access if required
  const hasProvinceAccess = provinceCheck ? provinceCheck() : true;

  if (!hasAccess || !hasProvinceAccess) {
    return (
      <Result
        status="403"
        title="403"
        subTitle={t("common.accessDenied")}
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            {t("common.goBack")}
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}; 