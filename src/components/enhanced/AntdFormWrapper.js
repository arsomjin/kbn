import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  Radio,
  Switch,
  Button,
  Row,
  Col,
  Space,
} from 'antd';
import { DatePicker } from 'elements';
import { usePermissions } from 'hooks/usePermissions';
import PermissionGate from 'components/PermissionGate';
import ProvinceSelector from 'components/ProvinceSelector';
import GeographicBranchSelector from 'components/GeographicBranchSelector';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

/**
 * Enhanced Ant Design Form Wrapper with RBAC Integration
 * Replaces Formik forms with modern Ant Design components and RBAC permissions
 */
const AntdFormWrapper = forwardRef(
  (
    {
      // Form configuration
      initialValues = {},
      onFinish,
      onFinishFailed,
      onValuesChange,

      // Layout
      layout = 'vertical',
      size = 'default',
      requiredMark = true,

      // Fields configuration
      fields = [],

      // Permissions
      requirePermission,
      customPermissionCheck,

      // Geographic filtering
      respectRBAC = true,

      // Form actions
      showSubmitButton = true,
      submitText = 'บันทึก',
      showResetButton = false,
      resetText = 'รีเซ็ต',

      // Custom styling
      className,
      style,

      // Loading state
      loading = false,
      disabled = false,

      ...formProps
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const { hasPermission, accessibleProvinces, accessibleBranches } =
      usePermissions();

    // Expose form methods to parent
    useImperativeHandle(
      ref,
      () => ({
        form,
        getFieldsValue: form.getFieldsValue,
        setFieldsValue: form.setFieldsValue,
        resetFields: form.resetFields,
        validateFields: form.validateFields,
        submit: () => form.submit(),
      }),
      [form]
    );

    // Set initial values when they change
    useEffect(() => {
      if (initialValues && Object.keys(initialValues).length > 0) {
        // Convert date strings to moment objects for DatePicker fields
        const processedValues = { ...initialValues };
        fields.forEach((field) => {
          if (field.type === 'date' && processedValues[field.name]) {
            processedValues[field.name] = moment(processedValues[field.name]);
          }
        });
        form.setFieldsValue(processedValues);
      }
    }, [initialValues, form, fields]);

    // Handle form submission
    const handleFinish = (values) => {
      // Convert moment objects back to strings for date fields
      const processedValues = { ...values };
      fields.forEach((field) => {
        if (field.type === 'date' && processedValues[field.name]) {
          processedValues[field.name] =
            processedValues[field.name].format('YYYY-MM-DD');
        }
      });

      onFinish && onFinish(processedValues);
    };

    // Render individual field based on type
    const renderField = (field) => {
      const {
        name,
        label,
        type = 'text',
        required = false,
        rules = [],
        options = [],
        placeholder,
        disabled: fieldDisabled = false,
        hidden = false,
        permission,
        customCheck,
        tooltip,
        extra,
        dependencies,
        ...fieldProps
      } = field;

      // Check field-level permissions
      if (permission && !hasPermission(permission)) {
        return null;
      }

      if (customCheck && !customCheck({ hasPermission })) {
        return null;
      }

      if (hidden) {
        return null;
      }

      // Prepare common form item props
      const formItemProps = {
        key: name,
        name,
        label,
        rules: required
          ? [{ required: true, message: `กรุณาป้อน${label}` }, ...rules]
          : rules,
        tooltip,
        extra,
        dependencies,
        hidden,
      };

      // Render based on field type
      switch (type) {
        case 'text':
        case 'email':
        case 'password':
          return (
            <Form.Item {...formItemProps}>
              <Input
                placeholder={placeholder || `ป้อน${label}`}
                disabled={disabled || fieldDisabled}
                type={type === 'password' ? 'password' : 'text'}
                {...fieldProps}
              />
            </Form.Item>
          );

        case 'textarea':
          return (
            <Form.Item {...formItemProps}>
              <TextArea
                placeholder={placeholder || `ป้อน${label}`}
                disabled={disabled || fieldDisabled}
                rows={4}
                {...fieldProps}
              />
            </Form.Item>
          );

        case 'number':
          return (
            <Form.Item {...formItemProps}>
              <InputNumber
                placeholder={placeholder || `ป้อน${label}`}
                disabled={disabled || fieldDisabled}
                style={{ width: '100%' }}
                {...fieldProps}
              />
            </Form.Item>
          );

        case 'select':
          return (
            <Form.Item {...formItemProps}>
              <Select
                placeholder={placeholder || `เลือก${label}`}
                disabled={disabled || fieldDisabled}
                allowClear
                showSearch
                optionFilterProp='children'
                {...fieldProps}
              >
                {options.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );

        case 'province':
          return (
            <Form.Item {...formItemProps}>
              <ProvinceSelector
                placeholder={placeholder || `เลือก${label}`}
                disabled={disabled || fieldDisabled}
                respectRBAC={respectRBAC}
                {...fieldProps}
              />
            </Form.Item>
          );

        case 'branch':
          return (
            <Form.Item {...formItemProps}>
              <GeographicBranchSelector
                placeholder={placeholder || `เลือก${label}`}
                disabled={disabled || fieldDisabled}
                respectRBAC={respectRBAC}
                {...fieldProps}
              />
            </Form.Item>
          );

        case 'date':
          return (
            <Form.Item {...formItemProps}>
              <DatePicker
                placeholder={placeholder || `เลือก${label}`}
                disabled={disabled || fieldDisabled}
                style={{ width: '100%' }}
                format='DD/MM/YYYY'
                {...fieldProps}
              />
            </Form.Item>
          );

        case 'checkbox':
          return (
            <Form.Item {...formItemProps} valuePropName='checked'>
              <Checkbox disabled={disabled || fieldDisabled} {...fieldProps}>
                {label}
              </Checkbox>
            </Form.Item>
          );

        case 'switch':
          return (
            <Form.Item {...formItemProps} valuePropName='checked'>
              <Switch
                disabled={disabled || fieldDisabled}
                checkedChildren='เปิด'
                unCheckedChildren='ปิด'
                {...fieldProps}
              />
            </Form.Item>
          );

        case 'radio':
          return (
            <Form.Item {...formItemProps}>
              <Radio.Group disabled={disabled || fieldDisabled} {...fieldProps}>
                {options.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          );

        case 'custom':
          return (
            <Form.Item {...formItemProps}>
              {field.render &&
                field.render({
                  form,
                  disabled: disabled || fieldDisabled,
                  ...fieldProps,
                })}
            </Form.Item>
          );

        default:
          return (
            <Form.Item {...formItemProps}>
              <Input
                placeholder={placeholder || `ป้อน${label}`}
                disabled={disabled || fieldDisabled}
                {...fieldProps}
              />
            </Form.Item>
          );
      }
    };

    // Render the form
    const formContent = (
      <Form
        form={form}
        layout={layout}
        size={size}
        requiredMark={requiredMark}
        onFinish={handleFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={onValuesChange}
        className={className}
        style={style}
        disabled={disabled}
        {...formProps}
      >
        {/* Render fields */}
        {fields.map((field) => {
          // Support for field groups/rows
          if (field.type === 'group') {
            return (
              <Row key={field.key || 'group'} gutter={16}>
                {field.fields.map((subField) => (
                  <Col key={subField.name} span={subField.span || 12}>
                    {renderField(subField)}
                  </Col>
                ))}
              </Row>
            );
          }

          return renderField(field);
        })}

        {/* Action buttons */}
        {(showSubmitButton || showResetButton) && (
          <Form.Item>
            <Space>
              {showSubmitButton && (
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={loading}
                  disabled={disabled}
                >
                  {submitText}
                </Button>
              )}
              {showResetButton && (
                <Button onClick={() => form.resetFields()} disabled={disabled}>
                  {resetText}
                </Button>
              )}
            </Space>
          </Form.Item>
        )}
      </Form>
    );

    // Wrap with permission gate if required
    if (requirePermission) {
      return (
        <PermissionGate
          permission={requirePermission}
          customCheck={customPermissionCheck}
        >
          {formContent}
        </PermissionGate>
      );
    }

    return formContent;
  }
);

AntdFormWrapper.displayName = 'AntdFormWrapper';

export default AntdFormWrapper;

/**
 * Form field type definitions for TypeScript-like documentation
 *
 * Field Types:
 * - text: Regular text input
 * - email: Email input with validation
 * - password: Password input
 * - textarea: Multi-line text input
 * - number: Number input
 * - select: Dropdown selection
 * - province: RBAC-enabled province selector
 * - branch: RBAC-enabled branch selector
 * - date: Date picker
 * - checkbox: Checkbox input
 * - switch: Toggle switch
 * - radio: Radio button group
 * - custom: Custom field with render function
 * - group: Group multiple fields in a row
 *
 * Example usage:
 *
 * const formFields = [
 *   {
 *     name: 'firstName',
 *     label: 'ชื่อ',
 *     type: 'text',
 *     required: true,
 *     rules: [{ min: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' }]
 *   },
 *   {
 *     name: 'province',
 *     label: 'จังหวัด',
 *     type: 'province',
 *     required: true,
 *     permission: 'admin.edit'
 *   },
 *   {
 *     type: 'group',
 *     fields: [
 *       { name: 'startDate', label: 'วันที่เริ่ม', type: 'date', span: 12 },
 *       { name: 'endDate', label: 'วันที่สิ้นสุด', type: 'date', span: 12 }
 *     ]
 *   }
 * ];
 */
