import React from 'react';
import { Row, Col, Form, Popconfirm, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Input } from 'elements';
import PrefixAnt from './PrefixAnt';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import { Address } from './NameAddress';
import { useModal } from '../contexts/ModalContext';

/**
 * Guarantors - A component for managing guarantor information
 *
 * Features:
 * - i18next translation support for all text content
 * - Form.List integration for dynamic guarantor management
 * - Responsive design with Ant Design Grid system
 * - Address component integration for guarantor addresses
 * - Permission-based access control (grant prop)
 * - Read-only mode support
 * - Optional required field validation
 * - Dark mode compatible styling
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Form field name for the guarantor list
 * @param {boolean} [props.notRequired=false] - Whether fields are optional
 * @param {string} [props.addText] - Custom text for add button
 * @param {boolean} [props.grant=true] - Whether user has permission to edit
 * @param {boolean} [props.readOnly=false] - Whether component is read-only
 * @param {Object} [props.values] - Form values object
 * @returns {JSX.Element} The guarantors management component
 */
const Guarantors = ({
  name,
  notRequired = false,
  addText,
  grant = true,
  readOnly = false,
  values,
  ...props
}) => {
  const { t } = useTranslation();
  const { showInfo } = useModal();

  return (
    <Form.List name={name} {...props}>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            {fields.map((field) => {
              const value = values?.[name]?.[field.name] || {};

              return (
                <div
                  key={field.key}
                  className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 pt-4 mb-4 rounded-lg"
                >
                  <div className="flex flex-row justify-between items-center mb-4">
                    <label className="text-gray-600 dark:text-gray-400 font-medium">
                      {t('guarantors.title', { number: field.name + 1 })}
                    </label>
                    <Popconfirm
                      title={t('guarantors.deleteConfirm')}
                      onConfirm={() => remove(field.name)}
                      onCancel={() => showInfo(t('guarantors.cancelDelete'))}
                      okText={t('common.confirm')}
                      cancelText={t('common.cancel')}
                      disabled={fields.length === 0 || !grant || readOnly}
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        disabled={!grant || readOnly}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </Popconfirm>
                  </div>

                  <Row gutter={[16, 16]} className="items-center">
                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item
                        name={[field.name, 'prefix']}
                        label={t('guarantors.prefix')}
                        className={formItemClass}
                      >
                        <PrefixAnt disabled={!grant || readOnly} readOnly={readOnly} />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item
                        name={[field.name, 'firstName']}
                        label={t('guarantors.firstName')}
                        className={formItemClass}
                        rules={[
                          {
                            required: !notRequired,
                            message: t('guarantors.validation.firstNameRequired'),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t('guarantors.firstName')}
                          disabled={!grant}
                          readOnly={readOnly}
                        />
                      </Form.Item>
                    </Col>

                    {!['หจก.', 'บจ.'].includes(value.prefix) && (
                      <Col xs={24} sm={12} md={6} lg={5}>
                        <Form.Item
                          name={[field.name, 'lastName']}
                          label={t('guarantors.lastName')}
                          className={formItemClass}
                        >
                          <Input
                            placeholder={t('guarantors.lastName')}
                            disabled={!grant}
                            readOnly={readOnly}
                          />
                        </Form.Item>
                      </Col>
                    )}

                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item
                        name={[field.name, 'phoneNumber']}
                        label={t('guarantors.phoneNumber')}
                        className={formItemClass}
                        rules={[
                          {
                            required: !notRequired || value.firstName,
                            message: t('guarantors.validation.phoneRequired'),
                          },
                          ...getRules(['mobileNumber']),
                        ]}
                      >
                        <Input
                          mask="111-1111111"
                          placeholder="012-3456789"
                          disabled={!grant}
                          readOnly={readOnly}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6} lg={4}>
                      <Form.Item
                        name={[field.name, 'relationship']}
                        label={t('guarantors.relationship')}
                        className={formItemClass}
                        rules={[
                          {
                            required: !notRequired || value.firstName,
                            message: t('guarantors.validation.relationshipRequired'),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t('guarantors.relationshipPlaceholder')}
                          disabled={!grant}
                          readOnly={readOnly}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {!!value?.address && (
                    <div className="mt-4">
                      <Address
                        parent={[field.name, 'address']}
                        address={value.address}
                        disabled={!grant}
                        readOnly={readOnly}
                        notRequired={notRequired && !value.firstName}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <Form.ErrorList errors={errors} />

            {!readOnly && grant && (
              <Form.Item className={fields.length > 0 ? 'mb-2 mt-2' : 'mb-2 mt-0'}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  size="middle"
                  icon={<PlusOutlined />}
                  disabled={!grant || readOnly}
                  className="border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"
                >
                  {addText || t('guarantors.addGuarantor')}
                </Button>
              </Form.Item>
            )}
          </>
        );
      }}
    </Form.List>
  );
};

export default Guarantors;
