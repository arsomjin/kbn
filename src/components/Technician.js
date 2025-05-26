import React, { Fragment } from 'react';

import { Row, Col } from 'shards-react';
import { Input, Button } from 'elements';
import { useSelector } from 'react-redux';
import HiddenItem from './HiddenItem';
import { Form, Select } from 'antd';
import { formItemClass } from 'data/Constant';
import { getRules } from 'api/Table';
const { Option } = Select;

const TechnicianInForm = ({ grant, onClick, values, size, form }) => {
  const { employees } = useSelector(state => state.data);
  let employeeArr = Object.keys(employees)
    .map(k => ({ ...employees[k], _key: k }))
    .filter(l => l?.position && l.position.indexOf('ช่าง') > -1);

  let employeeOptions = employeeArr.map(l => (
    <Option key={l._key} value={l._key}>{`${l.firstName}${l?.nickName ? `(${l.nickName})` : ''} ${l.lastName}`}</Option>
  ));
  // let employeeOptions = Object.keys(employees).map((key, ind) => ({
  //   value: key,
  //   label: `${employees[key].firstName}${
  //     employees[key]?.nickName ? `(${employees[key].nickName})` : ''
  //   } ${employees[key].lastName}`,
  // }));

  // employeeOptions = employeeOptions.filter(
  //   (l) =>
  //     employees[l.value].position &&
  //     employees[l.value].position.indexOf('ช่าง') > -1
  // );

  const errorFirstName = form.getFieldError('technicianFirstName');
  return (
    <Fragment>
      <Row form className="bg-light">
        <HiddenItem name="technicianId" />
        <HiddenItem name="technicianNo" />
        <HiddenItem name="technicianPrefix" />
        <HiddenItem name="technicianFirstName" required message="กรุณาป้อนชื่อช่าง" />
        {/* <HiddenItem name="technicianId" /> */}
        <Col md="6" className="d-flex flex-column">
          <Form.Item name="technicianId" label="ช่างบริการ">
            <Select
              showSearch
              placeholder={'ชื่อช่าง, นามสกุล, เบอร์โทร หรือ รหัสพนักงาน'}
              optionFilterProp="children"
              filterOption={(input, option) => {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
              dropdownStyle={{ minWidth: 280 }}
              mode="tags"
            >
              {employeeOptions}
            </Select>
          </Form.Item>
          {/* <SearchSelect
            size={size}
            id={'displayName'}
            // id={'firstName'}
            type={'text'}
            placeholder="ชื่อช่าง, นามสกุล, เบอร์โทร หรือ รหัสพนักงาน"
            onChange={(val) => {
              form.setFieldsValue({
                technicianId: val.value,
                ...(employees[val.value].employeeCode && {
                  technicianNo: employees[val.value].employeeCode,
                }),
                technicianFirstName: employees[val.value].firstName,
                technicianLastName: employees[val.value].lastName,
                technicianPhoneNumber: employees[val.value].phoneNumber,
              });
            }}
            options={employeeOptions}
            // onInputChange={(txt) => showLog('txt', txt)}
            defaultValue={employeeOptions.filter(
              (l) => l.value === values.technicianId
            )}
          />
          {errorFirstName[0] && (
            <strong className="text-danger">{errorFirstName[0]}</strong>
          )} */}
        </Col>
        <Col md="3">
          <Form.Item
            name="technicianPhoneNumber"
            label="เบอร์โทรศัพท์"
            className={formItemClass}
            rules={getRules(['mobileNumber'])}
          >
            <Input mask="111-1111111" placeholder="012-3456789" disabled={!grant} focusNextField={3} />
          </Form.Item>
        </Col>
        <Col md="2" className="pb-3">
          <Form.Item label="ข้อมูลช่าง" className={formItemClass}>
            <Button onClick={onClick} className="d-flex btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0">
              {values.technicianId ? 'ข้อมูลช่างเพิ่มเติม' : 'เพิ่มรายชื่อ'} &rarr;
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Fragment>
  );
};

export default TechnicianInForm;
