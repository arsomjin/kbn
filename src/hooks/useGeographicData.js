import { useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { usePermissions } from "./usePermissions";
import { 
  filterDataByGeographicAccess,
  getUserGeographicScope,
  canAccessProvince,
  canAccessBranch
} from "utils/geographic";

export const useGeographicData = () => {
  const { user } = useSelector((state) => state.auth);
  const { provinces } = useSelector((state) => state.provinces);
  const { branches } = useSelector((state) => state.data);
  const { getAccessibleProvinces, getAccessibleBranches } = usePermissions();

  // Get user's geographic scope
  const userScope = useMemo(() => {
    return getUserGeographicScope(user, provinces, branches);
  }, [user, provinces, branches]);

  // Filter sales data by geographic access
  const filterSalesData = useCallback((salesData) => {
    return filterDataByGeographicAccess(salesData, user, (sale) => ({
      province: sale.provinceId,
      branch: sale.branchCode
    }));
  }, [user]);

  // Filter customer data by geographic access
  const filterCustomerData = useCallback((customerData) => {
    return filterDataByGeographicAccess(customerData, user, (customer) => ({
      province: customer.address?.provinceId,
      branch: customer.branchCode
    }));
  }, [user]);

  // Filter service data by geographic access
  const filterServiceData = useCallback((serviceData) => {
    return filterDataByGeographicAccess(serviceData, user, (service) => ({
      province: service.serviceAddress?.provinceId,
      branch: service.branchCode
    }));
  }, [user]);

  // Filter vehicle data by geographic access
  const filterVehicleData = useCallback((vehicleData) => {
    return filterDataByGeographicAccess(vehicleData, user, (vehicle) => ({
      province: vehicle.provinceId,
      branch: vehicle.branchCode
    }));
  }, [user]);

  // Get provinces user can access
  const accessibleProvinces = useMemo(() => {
    return getAccessibleProvinces(provinces);
  }, [getAccessibleProvinces, provinces]);

  // Get branches user can access
  const accessibleBranches = useMemo(() => {
    return getAccessibleBranches(branches);
  }, [getAccessibleBranches, branches]);

  // Check if user can access specific province
  const checkProvinceAccess = useCallback((provinceKey) => {
    return canAccessProvince(user, provinceKey);
  }, [user]);

  // Check if user can access specific branch
  const checkBranchAccess = useCallback((branchCode) => {
    return canAccessBranch(user, branchCode, branches);
  }, [user, branches]);

  // Get current province from user's access
  const getCurrentProvince = useCallback(() => {
    if (user.homeProvince) {
      return user.homeProvince;
    }
    
    if (user.accessLevel === "province" && user.allowedProvinces?.length === 1) {
      return user.allowedProvinces[0];
    }
    
    if (user.accessLevel === "branch" && user.allowedBranches?.length > 0) {
      const firstBranch = branches[user.allowedBranches[0]];
      return firstBranch?.provinceId || null;
    }
    
    return null;
  }, [user, branches]);

  // Get default branch for user
  const getDefaultBranch = useCallback(() => {
    if (user.homeBranch) {
      return user.homeBranch;
    }
    
    if (user.accessLevel === "branch" && user.allowedBranches?.length === 1) {
      return user.allowedBranches[0];
    }
    
    return null;
  }, [user]);

  return {
    // User scope information
    userScope,
    accessibleProvinces,
    accessibleBranches,
    
    // Access check functions
    checkProvinceAccess,
    checkBranchAccess,
    
    // Data filtering functions
    filterSalesData,
    filterCustomerData,
    filterServiceData,
    filterVehicleData,
    
    // User defaults
    getCurrentProvince,
    getDefaultBranch,
    
    // User access level info
    isAllAccess: user.accessLevel === "all",
    isProvinceLevel: user.accessLevel === "province", 
    isBranchLevel: user.accessLevel === "branch",
    
    // Quick access to user geographic data
    userProvinces: user.allowedProvinces || [],
    userBranches: user.allowedBranches || [],
    homeProvince: user.homeProvince,
    homeBranch: user.homeBranch
  };
}; 