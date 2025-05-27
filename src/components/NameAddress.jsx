import React, { Fragment } from 'react';
import { Form, Select, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { Input } from 'elements';
import {
  Provinces,
  getAmphoesFromProvince,
  getTambolsFromAmphoe,
  getPostcodeFromProvinceAndAmphoe,
} from 'constants/thaiTambol';
import PrefixAnt from './PrefixAnt';
import { getRules } from 'api/Table';

/**
 * Name component for handling person/company name inputs with prefix
 * @param {Object} props - Component props
 * @param {Object} props.values - Form values
 * @param {boolean} props.disabled - Whether inputs are disabled
 * @param {boolean} props.readOnly - Whether inputs are read-only
 * @param {boolean} props.phoneNumberRequired - Whether phone number is required
 * @param {string} props.nameValue - Name field path in form
 * @returns {JSX.Element} Name input component
 */
export const Name = ({ values, disabled, readOnly, phoneNumberRequired, nameValue }) => {
  const { t } = useTranslation();

  const prefixValue = nameValue ? values[nameValue]?.prefix : values.prefix;
  const isCompany = ['หจก.', 'บจก.', 'บมจ.', 'ร้าน'].includes(prefixValue);

  return (
    <Fragment>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6} md={4} lg={3}>
          <Form.Item
            name={nameValue ? [nameValue, 'prefix'] : 'prefix'}
            label={t('components.nameAddress.prefix')}
            rules={getRules(['required'])}
          >
            <PrefixAnt
              disabled={disabled || readOnly}
              readOnly={readOnly}
              placeholder={t('components.nameAddress.prefixPlaceholder')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={9} md={6} lg={5}>
          <Form.Item
            name={nameValue ? [nameValue, 'firstName'] : 'firstName'}
            label={t('components.nameAddress.firstName')}
            rules={getRules(['required'])}
          >
            <Input
              placeholder={t('components.nameAddress.firstNamePlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        {/* Last name - only show for non-company prefixes */}
        {!isCompany && (
          <Col xs={24} sm={9} md={6} lg={6}>
            <Form.Item
              name={nameValue ? [nameValue, 'lastName'] : 'lastName'}
              label={t('components.nameAddress.lastName')}
            >
              <Input
                placeholder={t('components.nameAddress.lastNamePlaceholder')}
                disabled={disabled}
                readOnly={readOnly}
              />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} sm={12} md={6} lg={6}>
          <Form.Item
            name={nameValue ? [nameValue, 'phoneNumber'] : 'phoneNumber'}
            label={t('components.nameAddress.phoneNumber')}
            rules={getRules(phoneNumberRequired ? ['required', 'mobileNumber'] : ['mobileNumber'])}
          >
            <Input
              disabled={disabled}
              readOnly={readOnly}
              mask="111-1111111"
              placeholder="012-3456789"
            />
          </Form.Item>
        </Col>
      </Row>
    </Fragment>
  );
};
/**
 * Address component for handling Thai address inputs with province/amphoe/tambol selection
 * @param {Object} props - Component props
 * @param {Object} props.address - Current address values
 * @param {Array} props.parent - Parent field path in form
 * @param {boolean} props.disabled - Whether inputs are disabled
 * @param {string} props.label - Label for the address section
 * @param {boolean} props.noLabel - Whether to hide the label
 * @param {boolean} props.readOnly - Whether inputs are read-only
 * @param {boolean} props.notRequired - Whether address fields are not required
 * @returns {JSX.Element} Address input component
 */
export const Address = ({ address, parent, disabled, label, noLabel, readOnly, notRequired }) => {
  const { t } = useTranslation();

  // Get address data based on selections
  const Amphoes = address?.province ? getAmphoesFromProvince(address.province) : [];
  const TambolFromAmphoe = address?.amphoe ? getTambolsFromAmphoe(address.amphoe) : [];
  const Postcodes =
    address?.province && address?.amphoe
      ? getPostcodeFromProvinceAndAmphoe(address.province, address.amphoe)
      : [];

  const getParent = (field) => (parent ? [...parent, field] : ['address', field]);

  return (
    <Fragment>
      {!noLabel && (
        <label className="text-gray-700 dark:text-gray-300 mb-2 block">
          {label || t('components.nameAddress.address')}
        </label>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('address')}
            label={t('components.nameAddress.houseNumber')}
            rules={[
              { required: !notRequired, message: t('components.nameAddress.validation.required') },
            ]}
          >
            <Input
              placeholder={t('components.nameAddress.houseNumberPlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name={getParent('moo')} label={t('components.nameAddress.moo')}>
            <Input
              placeholder={t('components.nameAddress.mooPlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name={getParent('village')} label={t('components.nameAddress.village')}>
            <Input
              placeholder={t('components.nameAddress.villagePlaceholder')}
              disabled={disabled}
              readOnly={readOnly}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('province')}
            rules={[
              { required: !notRequired, message: t('components.nameAddress.validation.required') },
            ]}
            label={t('components.nameAddress.province')}
          >
            <Select
              showSearch
              placeholder={t('components.nameAddress.provincePlaceholder')}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              filterSort={(optionA, optionB) =>
                optionA.children
                  .toLowerCase()
                  .localeCompare(optionB.children.toString().toLowerCase())
              }
              disabled={disabled || readOnly}
            >
              {Provinces().map((pv, i) => (
                <Select.Option key={i} value={pv.p}>
                  {pv.p}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('amphoe')}
            rules={[
              { required: !notRequired, message: t('components.nameAddress.validation.required') },
            ]}
            label={t('components.nameAddress.amphoe')}
          >
            <Select
              showSearch
              placeholder={t('components.nameAddress.amphoeePlaceholder')}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              filterSort={(optionA, optionB) =>
                optionA.children
                  .toLowerCase()
                  .localeCompare(optionB.children.toString().toLowerCase())
              }
              disabled={disabled || readOnly}
            >
              {Amphoes.map((ap, i) => (
                <Select.Option key={i} value={ap.a}>
                  {ap.a}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('tambol')}
            rules={[
              { required: !notRequired, message: t('components.nameAddress.validation.required') },
            ]}
            label={t('components.nameAddress.tambol')}
          >
            <Select
              showSearch
              placeholder={t('components.nameAddress.tambolPlaceholder')}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              filterSort={(optionA, optionB) =>
                optionA.children
                  .toLowerCase()
                  .localeCompare(optionB.children.toString().toLowerCase())
              }
              disabled={disabled || readOnly}
            >
              {TambolFromAmphoe.map((tb, i) => (
                <Select.Option key={i} value={tb.value}>
                  {tb.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item
            name={getParent('postcode')}
            rules={[
              { required: !notRequired, message: t('components.nameAddress.validation.required') },
            ]}
            label={t('components.nameAddress.postcode')}
          >
            <Select
              showSearch
              placeholder={t('components.nameAddress.postcodePlaceholder')}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              filterSort={(optionA, optionB) =>
                optionA.children
                  .toLowerCase()
                  .localeCompare(optionB.children.toString().toLowerCase())
              }
              disabled={disabled || readOnly}
            >
              {Postcodes.map((pc, i) => (
                <Select.Option key={i} value={pc.z}>
                  {pc.z}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Fragment>
  );
};
