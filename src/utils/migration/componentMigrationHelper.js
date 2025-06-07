import { message } from 'antd';

/**
 * Component Migration Helper for Phase 2 Library Modernization
 * 
 * This utility helps identify and migrate:
 * - Formik forms → AntdFormWrapper
 * - react-select → AntdSelect  
 * - shards-react components → Ant Design
 * - Material-UI components → Ant Design
 */

/**
 * Migration mapping for common component replacements
 */
export const COMPONENT_MIGRATION_MAP = {
  // Formik to Ant Design Forms
  formik: {
    'Formik': 'AntdFormWrapper',
    'Field': 'Form.Item',
    'Form': 'Form',
    'ErrorMessage': 'Form.Item with validateStatus'
  },
  
  // react-select to Ant Design Select
  reactSelect: {
    'Select': 'AntdSelect',
    'AsyncSelect': 'AntdSelect with loading',
    'CreatableSelect': 'AntdSelect with mode="tags"'
  },
  
  // shards-react to Ant Design
  shardsReact: {
    'FormInput': 'Input',
    'FormSelect': 'Select',
    'FormTextarea': 'Input.TextArea',
    'FormGroup': 'Form.Item',
    'Button': 'Button',
    'Card': 'Card',
    'CardHeader': 'Card with title',
    'CardBody': 'Card content',
    'Container': 'div with container styling',
    'Row': 'Row',
    'Col': 'Col'
  },
  
  // Material-UI to Ant Design
  materialUI: {
    'TextField': 'Input',
    'Select': 'Select',
    'Button': 'Button',
    'Card': 'Card',
    'Typography': 'Typography',
    'Grid': 'Row/Col',
    'Paper': 'Card',
    'Dialog': 'Modal'
  }
};

/**
 * Form field type mapping for AntdFormWrapper
 */
export const FIELD_TYPE_MAPPING = {
  // Basic inputs
  'text': 'text',
  'email': 'email', 
  'password': 'password',
  'number': 'number',
  'textarea': 'textarea',
  
  // Selections
  'select': 'select',
  'radio': 'radio',
  'checkbox': 'checkbox',
  'switch': 'switch',
  
  // Date/Time
  'date': 'date',
  'datetime': 'date',
  'time': 'time',
  
  // RBAC-enhanced
  'province': 'province',
  'branch': 'branch',
  'user': 'select', // With RBAC filtering
  'department': 'select' // With RBAC filtering
};

/**
 * Generate AntdFormWrapper field configuration from legacy form structure
 */
export const generateFormFields = (legacyFormSchema) => {
  if (!legacyFormSchema || !Array.isArray(legacyFormSchema)) {
    console.warn('Invalid form schema provided');
    return [];
  }

  return legacyFormSchema.map(field => {
    const {
      name,
      label,
      type = 'text',
      required = false,
      validation = [],
      options = [],
      permission,
      placeholder,
      disabled = false,
      ...rest
    } = field;

    // Map legacy field type to new field type
    const mappedType = FIELD_TYPE_MAPPING[type] || 'text';
    
    // Convert validation rules
    const rules = [];
    if (required) {
      rules.push({ required: true, message: `กรุณาป้อน${label}` });
    }
    
    // Add legacy validation rules
    validation.forEach(rule => {
      if (rule.min) {
        rules.push({ min: rule.min, message: rule.message || `${label}ต้องมีอย่างน้อย ${rule.min} ตัวอักษร` });
      }
      if (rule.max) {
        rules.push({ max: rule.max, message: rule.message || `${label}ต้องไม่เกิน ${rule.max} ตัวอักษร` });
      }
      if (rule.pattern) {
        rules.push({ pattern: rule.pattern, message: rule.message || `รูปแบบ${label}ไม่ถูกต้อง` });
      }
      if (rule.email) {
        rules.push({ type: 'email', message: rule.message || 'รูปแบบอีเมลไม่ถูกต้อง' });
      }
    });

    return {
      name,
      label,
      type: mappedType,
      required,
      rules,
      options,
      permission,
      placeholder: placeholder || `ป้อน${label}`,
      disabled,
      ...rest
    };
  });
};

/**
 * Convert react-select options to Ant Design Select format
 */
export const convertSelectOptions = (reactSelectOptions) => {
  if (!Array.isArray(reactSelectOptions)) {
    return [];
  }

  return reactSelectOptions.map(option => {
    // Handle different option formats
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    
    if (option.value !== undefined && option.label !== undefined) {
      return {
        value: option.value,
        label: option.label,
        disabled: option.disabled || false,
        description: option.description,
        permission: option.permission
      };
    }
    
    // Handle grouped options
    if (option.options && Array.isArray(option.options)) {
      return {
        label: option.label,
        options: convertSelectOptions(option.options)
      };
    }
    
    return option;
  });
};

/**
 * Migration helper for individual components
 */
export class ComponentMigrationHelper {
  constructor() {
    this.migrationLog = [];
  }

  /**
   * Log migration action
   */
  log(action, component, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      component,
      details
    };
    this.migrationLog.push(entry);
    console.log(`🔄 Migration: ${action} - ${component}`, details);
  }

  /**
   * Migrate Formik form to AntdFormWrapper
   */
  migrateFormikForm(formikConfig) {
    this.log('MIGRATE_FORMIK', 'Formik → AntdFormWrapper', formikConfig);
    
    const {
      initialValues = {},
      validationSchema,
      onSubmit,
      children,
      fields = [],
      ...rest
    } = formikConfig;

    // Convert validation schema to field rules if provided
    const enhancedFields = generateFormFields(fields);
    
    const antdFormConfig = {
      initialValues,
      onFinish: onSubmit,
      fields: enhancedFields,
      respectRBAC: true,
      ...rest
    };

    message.success('Successfully migrated Formik form to AntdFormWrapper');
    return antdFormConfig;
  }

  /**
   * Migrate react-select to AntdSelect
   */
  migrateReactSelect(selectConfig) {
    this.log('MIGRATE_SELECT', 'react-select → AntdSelect', selectConfig);
    
    const {
      options = [],
      value,
      onChange,
      placeholder,
      isDisabled,
      isLoading,
      isMulti,
      isSearchable,
      isClearable,
      ...rest
    } = selectConfig;

    const antdSelectConfig = {
      options: convertSelectOptions(options),
      value,
      onChange,
      placeholder,
      disabled: isDisabled,
      loading: isLoading,
      mode: isMulti ? 'multiple' : undefined,
      showSearch: isSearchable !== false,
      allowClear: isClearable !== false,
      respectRBAC: true,
      ...rest
    };

    message.success('Successfully migrated react-select to AntdSelect');
    return antdSelectConfig;
  }

  /**
   * Migrate shards-react components
   */
  migrateShardsComponent(componentType, props) {
    this.log('MIGRATE_SHARDS', `${componentType} → Ant Design`, props);
    
    const mapping = COMPONENT_MIGRATION_MAP.shardsReact[componentType];
    if (!mapping) {
      console.warn(`No migration mapping found for shards-react ${componentType}`);
      return props;
    }

    // Component-specific migration logic
    switch (componentType) {
      case 'FormInput':
        return {
          placeholder: props.placeholder,
          disabled: props.disabled,
          value: props.value,
          onChange: props.onChange,
          size: props.size,
          ...props
        };
        
      case 'FormSelect':
        return {
          placeholder: props.placeholder,
          disabled: props.disabled,
          value: props.value,
          onChange: props.onChange,
          options: convertSelectOptions(props.children || []),
          ...props
        };
        
      case 'Button':
        return {
          type: props.theme === 'primary' ? 'primary' : 'default',
          size: props.size,
          disabled: props.disabled,
          loading: props.loading,
          onClick: props.onClick,
          children: props.children,
          ...props
        };
        
      default:
        return props;
    }
  }

  /**
   * Generate migration report
   */
  generateReport() {
    const report = {
      totalMigrations: this.migrationLog.length,
      byType: {},
      timeline: this.migrationLog,
      recommendations: []
    };

    // Group by migration type
    this.migrationLog.forEach(entry => {
      const type = entry.action;
      report.byType[type] = (report.byType[type] || 0) + 1;
    });

    // Generate recommendations
    if (report.byType.MIGRATE_FORMIK > 0) {
      report.recommendations.push('Consider creating reusable form templates for common use cases');
    }
    
    if (report.byType.MIGRATE_SELECT > 0) {
      report.recommendations.push('Review RBAC filtering requirements for all select components');
    }

    return report;
  }

  /**
   * Export migration log for review
   */
  exportLog() {
    const logData = {
      migrationSession: new Date().toISOString(),
      log: this.migrationLog,
      report: this.generateReport()
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `migration-log-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    message.success('Migration log exported successfully');
  }
}

/**
 * Global migration helper instance
 */
export const migrationHelper = new ComponentMigrationHelper();

/**
 * Convenience functions for common migrations
 */

/**
 * Quick Formik to AntdFormWrapper migration
 */
export const migrateFormik = (formikProps) => {
  return migrationHelper.migrateFormikForm(formikProps);
};

/**
 * Quick react-select to AntdSelect migration
 */
export const migrateSelect = (selectProps) => {
  return migrationHelper.migrateReactSelect(selectProps);
};

/**
 * Batch migrate multiple components
 */
export const batchMigrate = (components) => {
  const results = {};
  
  components.forEach(({ type, name, props }) => {
    switch (type) {
      case 'formik':
        results[name] = migrateFormik(props);
        break;
      case 'select':
        results[name] = migrateSelect(props);
        break;
      case 'shards':
        results[name] = migrationHelper.migrateShardsComponent(name, props);
        break;
      default:
        console.warn(`Unknown migration type: ${type}`);
    }
  });
  
  return results;
};

/**
 * Validation helpers for migration
 */
export const validateMigration = {
  /**
   * Check if form fields are properly configured
   */
  formFields: (fields) => {
    const errors = [];
    
    fields.forEach((field, index) => {
      if (!field.name) {
        errors.push(`Field ${index}: Missing 'name' property`);
      }
      if (!field.label) {
        errors.push(`Field ${index}: Missing 'label' property`);
      }
      if (field.type && !FIELD_TYPE_MAPPING[field.type]) {
        errors.push(`Field ${index}: Unknown field type '${field.type}'`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Check if select options are properly formatted
   */
  selectOptions: (options) => {
    const errors = [];
    
    if (!Array.isArray(options)) {
      errors.push('Options must be an array');
      return { valid: false, errors };
    }
    
    options.forEach((option, index) => {
      if (typeof option === 'object' && option !== null) {
        if (option.value === undefined) {
          errors.push(`Option ${index}: Missing 'value' property`);
        }
        if (option.label === undefined) {
          errors.push(`Option ${index}: Missing 'label' property`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default ComponentMigrationHelper; 