import { useTranslation } from 'react-i18next';

export interface TranslationKeys {
  modal: {
    tabs: {
      role: string;
      permissions: string;
      provinces: string;
      summary: string;
    };
    roleSection: {
      title: string;
      label: string;
      description: string;
      info: string;
    };
    permissionsSection: {
      title: string;
      description: string;
      available: string;
      assigned: string;
      reset: string;
      moveButtons: {
        toRight: string;
        toLeft: string;
      };
    };
    provincesSection: {
      title: string;
      description: string;
      select: string;
      extra: string;
      placeholder: string;
      warning: string;
      autoAccess: string;
      autoAccessDescription: string;
      employeeWarning: string;
    };
    summarySection: {
      title: string;
      selectedRole: string;
      userDetails: string;
      confirmChanges: string;
    };
  };
}

export const useModalTranslations = (namespace: string = 'userRoleManager', keyPrefix: string = 'editModal') => {
  const { t } = useTranslation([namespace, 'common']);

  const getTranslation = (key: string, fallbackKey?: string, defaultValue: string = '') => {
    // Try namespace-prefixed key first
    const namespacedKey = `${namespace}.${keyPrefix}.${key}`;
    const fallback = fallbackKey ? `${keyPrefix}.${fallbackKey}` : undefined;

    return t(namespacedKey, {
      defaultValue: fallback ? t(fallback, defaultValue) : defaultValue
    });
  };

  return {
    t: getTranslation,
    modal: {
      tabs: {
        role: getTranslation('tabs.role', 'tabs.role', 'Role'),
        permissions: getTranslation('tabs.permissions', 'tabs.permissions', 'Permissions'),
        provinces: getTranslation('tabs.provinces', 'tabs.provinces', 'Provinces'),
        summary: getTranslation('tabs.summary', 'tabs.summary', 'Summary')
      },
      roleSection: {
        title: getTranslation('roleTitle', 'roleTitle', 'Select User Role'),
        label: getTranslation('roleLabel', 'roleLabel', 'Role'),
        description: getTranslation('roleDescription', 'roleDescription', 'Assign a role to control user access'),
        info: getTranslation('roleInfo', 'roleInfo', 'Role Information')
      },
      permissionsSection: {
        title: getTranslation('permissionsTitle', 'permissionsTitle', 'Assign Permissions'),
        description: getTranslation('permissionsDescription', 'permissionsDescription', 'Select permissions to grant'),
        available: getTranslation('availablePermissions', 'availablePermissions', 'Available Permissions'),
        assigned: getTranslation('assignedPermissions', 'assignedPermissions', 'Assigned Permissions'),
        reset: getTranslation('resetPermissions', 'resetPermissions', 'Reset Permissions'),
        moveButtons: {
          toRight: getTranslation('moveButtons.toRight', 'moveButtons.toRight', 'Add selected permissions'),
          toLeft: getTranslation('moveButtons.toLeft', 'moveButtons.toLeft', 'Remove selected permissions')
        }
      },
      provincesSection: {
        title: getTranslation('provincesTitle', 'provincesTitle', 'Assign Provinces'),
        description: getTranslation('provincesDescription', 'provincesDescription', 'Select provinces'),
        select: getTranslation('selectProvinces', 'selectProvinces', 'Select Provinces'),
        extra: getTranslation('provincesExtra', 'provincesExtra', 'Multiple provinces can be selected'),
        placeholder: getTranslation('selectProvincesPlaceholder', 'selectProvincesPlaceholder', 'Select provinces...'),
        warning: getTranslation('noProvincesWarning', 'noProvincesWarning', 'No provinces selected'),
        autoAccess: getTranslation('autoProvinceAccess', 'autoProvinceAccess', 'Automatic Province Access'),
        autoAccessDescription: getTranslation(
          'autoProvinceAccessDescription',
          'autoProvinceAccessDescription',
          'This role has access to all provinces'
        ),
        employeeWarning: getTranslation(
          'employeeProvinceWarning',
          'employeeProvinceWarning',
          'Employee is assigned to province: {{provinceName}}'
        )
      },
      summarySection: {
        title: getTranslation('summaryTitle', 'summaryTitle', 'User Access Summary'),
        selectedRole: getTranslation('selectedRole', 'selectedRole', 'Selected Role'),
        userDetails: getTranslation('userDetails', 'userDetails', 'User Details'),
        confirmChanges: getTranslation('confirmChanges', 'confirmChanges', 'Please review and confirm changes')
      }
    }
  };
};
