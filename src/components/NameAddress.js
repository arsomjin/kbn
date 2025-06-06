import React from 'react';
import { Form, Select } from 'antd';
import { Provinces } from 'data/thaiTambol';
import { Input } from 'elements';
import { getAmphoesFromProvince, getTambolsFromAmphoe, getPostcodeFromProvinceAndAmphoe } from 'data/thaiTambol';
import PrefixAnt from './PrefixAnt';
import { Fragment } from 'react';
import { Row, Col } from 'shards-react';
import { getRules } from 'api/Table';

export const Name = ({ values, disabled, readOnly, phoneNumberRequired, nameValue }) => {
  return (
    <Fragment>
      <Row noGutters>
        <Col md="2">
          <Form.Item
            name={!!nameValue ? [nameValue, 'prefix'] : 'prefix'}
            label="คำนำหน้า"
            rules={getRules(['required'])}
          >
            <PrefixAnt disabled={disabled || readOnly} readOnly={readOnly} placeholder="คำนำหน้า" />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item
            name={!!nameValue ? [nameValue, 'firstName'] : 'firstName'}
            label="ชื่อ"
            rules={getRules(['required'])}
          >
            <Input placeholder="กรุณาป้อนชื่อ" disabled={disabled} readOnly={readOnly} />
          </Form.Item>
        </Col>
        {/* นามสกุล */}
        {!['หจก.', 'บจก.', 'บมจ.', 'ร้าน'].includes(!!nameValue ? values[nameValue]?.prefix : values.prefix) && (
          <Col md="4">
            <Form.Item name={!!nameValue ? [nameValue, 'lastName'] : 'lastName'} label="นามสกุล">
              <Input placeholder="นามสกุล" disabled={disabled} readOnly={readOnly} />
            </Form.Item>
          </Col>
        )}
        <Col md="3">
          <Form.Item
            name={!!nameValue ? [nameValue, 'phoneNumber'] : 'phoneNumber'}
            label="เบอร์โทร"
            rules={getRules(phoneNumberRequired ? ['required', 'mobileNumber'] : ['mobileNumber'])}
          >
            <Input disabled={disabled} readOnly={readOnly} mask="111-1111111" placeholder="012-3456789" />
          </Form.Item>
        </Col>
      </Row>
    </Fragment>
  );
};
export const Address = ({ address, parent, disabled, label, noLabel, readOnly, notRequired }) => {
  // showLog('address', address);
  const Amphoes = address?.province ? getAmphoesFromProvince(address.province) : [];
  const TambolFromAmphoe = address?.amphoe ? getTambolsFromAmphoe(address.amphoe) : [];
  const Postcodes =
    address?.province && address?.amphoe ? getPostcodeFromProvinceAndAmphoe(address.province, address.amphoe) : [];
  const getParent = field => (parent ? [...parent, field] : ['address', field]);
  return (
    <Fragment>
      {!noLabel && <label className="text-light mb-2">{label || 'ที่อยู่'}</label>}
      <Row noGutters>
        <Col md="3">
          <Form.Item
            name={getParent('address')}
            label="บ้านเลขที่"
            rules={[{ required: !notRequired, message: 'กรุณาป้อนข้อมูล' }]}
          >
            <Input placeholder="บ้านเลขที่" disabled={disabled} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item name={getParent('moo')} label="หมู่ที่">
            <Input placeholder="หมู่ที่" disabled={disabled} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item name={getParent('village')} label="หมู่บ้าน">
            <Input placeholder="หมู่บ้าน" disabled={disabled} readOnly={readOnly} />
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item
            name={getParent('province')}
            rules={[{ required: !notRequired, message: 'กรุณาป้อนข้อมูล' }]}
            label="จังหวัด"
          >
            <Select
              showSearch
              style={{
                display: 'flex'
              }}
              placeholder="จังหวัด"
              optionFilterProp="children"
              filterOption={(input, option) => {
                // showLog({ option, input });
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
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
      <Row noGutters>
        <Col md="3">
          <Form.Item
            name={getParent('amphoe')}
            rules={[{ required: !notRequired, message: 'กรุณาป้อนข้อมูล' }]}
            label="อำเภอ"
          >
            <Select
              showSearch
              style={{
                display: 'flex'
              }}
              placeholder="อำเภอ"
              optionFilterProp="children"
              filterOption={(input, option) => {
                // showLog({ option, input });
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
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
        <Col md="3">
          <Form.Item
            name={getParent('tambol')}
            rules={[{ required: !notRequired, message: 'กรุณาป้อนข้อมูล' }]}
            label="ตำบล"
          >
            <Select
              showSearch
              style={{
                display: 'flex'
              }}
              placeholder="ตำบล"
              optionFilterProp="children"
              filterOption={(input, option) => {
                // showLog({ option, input });
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
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
        <Col md="3">
          <Form.Item
            name={getParent('postcode')}
            rules={[{ required: !notRequired, message: 'กรุณาป้อนข้อมูล' }]}
            label="รหัสไปรษณีย์"
          >
            <Select
              showSearch
              style={{
                display: 'flex'
              }}
              placeholder="รหัสไปรษณีย์"
              optionFilterProp="children"
              filterOption={(input, option) => {
                // showLog({ option, input });
                return option.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
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
