import { useContext, useCallback } from "react";
import { ProvinceContext, ProvinceContextType, Province } from "../contexts/ProvinceContext";
import { message } from "antd";

export const useProvince = (): ProvinceContextType => {
  const context = useContext(ProvinceContext);
  if (!context) {
    throw new Error("useProvince must be used within a ProvinceProvider");
  }

  const { currentProvince, setCurrentProvince, provinces, getProvinceById, hasProvinceAccess } = context;

  const switchProvince = useCallback((provinceId: string) => {
    const province = getProvinceById(provinceId);
    if (!province) {
      message.error("Province not found");
      return false;
    }

    if (!hasProvinceAccess(provinceId)) {
      message.error("You don't have access to this province");
      return false;
    }

    setCurrentProvince(province);
    return true;
  }, [getProvinceById, hasProvinceAccess, setCurrentProvince]);

  const getProvinceName = useCallback((provinceId: string): string => {
    const province = getProvinceById(provinceId);
    return province?.name || "Unknown Province";
  }, [getProvinceById]);

  return {
    ...context,
    switchProvince,
    getProvinceName,
  };
}; 