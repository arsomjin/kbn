import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import { Employee, EmployeeFormData, EmployeeFilters } from "../types";
import { employeeService } from "../services/employeeService";
import { useAuth } from "../../../hooks/useAuth";
import { useProvince } from "../../../hooks/useProvince";

export const useEmployee = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentProvince } = useProvince();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>({});

  const loadEmployees = useCallback(async () => {
    if (!currentProvince?.id) return;
    
    try {
      setLoading(true);
      const data = await employeeService.getEmployees(currentProvince.id, filters);
      setEmployees(data);
    } catch (error) {
      message.error(t("employees.error.loading"));
    } finally {
      setLoading(false);
    }
  }, [currentProvince?.id, filters, t]);

  const loadEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployeeById(id);
      setSelectedEmployee(data);
      return data;
    } catch (error) {
      message.error(t("employees.error.loading"));
      return null;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const createEmployee = useCallback(async (data: EmployeeFormData) => {
    if (!currentProvince?.id || !user?.uid) return;

    try {
      setLoading(true);
      const id = await employeeService.createEmployee(
        { ...data, provinceId: currentProvince.id },
        user.uid
      );
      message.success(t("employees.success.created"));
      return id;
    } catch (error) {
      message.error(t("employees.error.saving"));
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentProvince?.id, user?.uid, t]);

  const updateEmployee = useCallback(async (id: string, data: Partial<EmployeeFormData>) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await employeeService.updateEmployee(id, data, user.uid);
      message.success(t("employees.success.updated"));
      return true;
    } catch (error) {
      message.error(t("employees.error.saving"));
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, t]);

  const deleteEmployee = useCallback(async (id: string) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      await employeeService.deleteEmployee(id, user.uid);
      message.success(t("employees.success.deleted"));
      return true;
    } catch (error) {
      message.error(t("employees.error.deleting"));
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, t]);

  const updateFilters = useCallback((newFilters: Partial<EmployeeFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    loading,
    employees,
    selectedEmployee,
    filters,
    loadEmployees,
    loadEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateFilters,
  };
}; 