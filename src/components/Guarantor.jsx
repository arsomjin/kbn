import React from 'react';
import { Row, Col, Form, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';
import { Input } from 'elements';
import PrefixAnt from './PrefixAnt';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
import { Address } from './NameAddress';

const { Panel } = Collapse;

/**
 * Guarantor - Modern guarantor information form component
 * @param {Object} props - Component props
 * @param {boolean} props.grant - Permission to edit guarantor information
 * @param {Object} props.values - Form values object
 * @param {boolean} props.notRequired - Remove required validation
 * @param {boolean} props.readOnly - Make fields read-only
 */
const Guarantor = ({ grant = true, values = {}, notRequired = false, readOnly = false }) => {
  const { t } = useTranslation();
  const guarantor = values.guarantor || {};

  const isCompany = ['หจก.', 'บจ.'].includes(guarantor.prefix);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-4">
        {t('components.guarantor.title')}
      </h3>

      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={['guarantor', 'prefix']}
            label={t('components.guarantor.prefix')}
            className={formItemClass}
          >
            <PrefixAnt
              disabled={!grant}
              readOnly={readOnly}
              placeholder={t('components.guarantor.prefixPlaceholder')}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={isCompany ? 12 : 8}>
          <Form.Item
            name={['guarantor', 'firstName']}
            label={
              isCompany
                ? t('components.guarantor.companyName')
                : t('components.guarantor.firstName')
            }
            className={formItemClass}
            rules={[
              {
                required: !notRequired,
                message: t('components.guarantor.validation.firstNameRequired'),
              },
            ]}
          >
            <Input
              placeholder={
                isCompany
                  ? t('components.guarantor.companyNamePlaceholder')
                  : t('components.guarantor.firstNamePlaceholder')
              }
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>

        {!isCompany && (
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name={['guarantor', 'lastName']}
              label={t('components.guarantor.lastName')}
              className={formItemClass}
            >
              <Input
                placeholder={t('components.guarantor.lastNamePlaceholder')}
                disabled={!grant}
                readOnly={readOnly}
              />
            </Form.Item>
          </Col>
        )}

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={['guarantor', 'phoneNumber']}
            label={t('components.guarantor.phoneNumber')}
            className={formItemClass}
            rules={[
              {
                required: !notRequired || guarantor.firstName,
                message: t('components.guarantor.validation.phoneNumberRequired'),
              },
              ...getRules(['mobileNumber']),
            ]}
          >
            <Input
              mask="111-1111111"
              placeholder={t('components.guarantor.phoneNumberPlaceholder')}
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={['guarantor', 'relationship']}
            label={t('components.guarantor.relationship')}
            className={formItemClass}
            rules={[
              {
                required: !notRequired || guarantor.firstName,
                message: t('components.guarantor.validation.relationshipRequired'),
              },
            ]}
          >
            <Input
              placeholder={t('components.guarantor.relationshipPlaceholder')}
              disabled={!grant}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
      </Row>

      {guarantor?.address && (
        <div className="mt-4">
          <Collapse ghost className="bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Panel
              header={t('components.guarantor.addressSection')}
              key="address"
              className="text-gray-700 dark:text-gray-300"
            >
              <Address
                parent={['guarantor', 'address']}
                address={guarantor?.address}
                disabled={!grant}
                readOnly={readOnly}
                notRequired={notRequired && !guarantor.firstName}
              />
            </Panel>
          </Collapse>
        </div>
      )}
    </div>
  );
};

export default Guarantor;
