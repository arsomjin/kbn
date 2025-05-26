import React, { Fragment } from 'react';

import { Row, Col, Button } from 'shards-react';
import { SearchSelect } from 'elements';
import { useSelector } from 'react-redux';
import { FInput } from 'Formiks';

const TechnicianInForm = ({ grant, onClick, values, errors, setFieldValue }) => {
  const { employees } = useSelector(state => state.data);
  let employeeOptions = Object.keys(employees).map((key, ind) => ({
    value: key,
    label: `${employees[key].firstName}${
      employees[key]?.nickName ? `(${employees[key].nickName})` : ''
    } ${employees[key].lastName}`
  }));

  employeeOptions = employeeOptions.filter(
    l => employees[l.value].position && employees[l.value].position.indexOf('ช่าง') > -1
  );

  return (
    <Fragment>
      <Row form className="bg-light">
        <Col md="6" className="form-group">
          <label>ชื่อช่างบริการ</label>
          <SearchSelect
            id={'displayName'}
            // id={'firstName'}
            type={'text'}
            placeholder="ชื่อช่าง, นามสกุล, เบอร์โทร หรือ รหัสพนักงาน"
            error={errors.technicianId || errors.technicianFirstName}
            onChange={val => {
              setFieldValue('technicianId', val.value);
              employees[val.value].employeeCode && setFieldValue('technicianNo', employees[val.value].employeeCode);
              setFieldValue('technicianFirstName', employees[val.value].firstName);
              setFieldValue('technicianLastName', employees[val.value].lastName);
              setFieldValue('technicianPhoneNumber', employees[val.value].phoneNumber || '');
            }}
            options={employeeOptions}
            // onInputChange={(txt) => showLog('txt', txt)}
            defaultValue={employeeOptions.filter(l => l.value === values.technicianId)}
          />
        </Col>
        {/* Last Name */}
        {/* <Col md="4" className="form-group">
          <label>นามสกุล</label>
          <TextInput
            name="lastName"
            placeholder="นามสกุล"
            error={errors.lastName}
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!grant}
          />
        </Col> */}
        <Col md="3" className="form-group">
          <label>เบอร์โทรศัพท์</label>
          <FInput name="technicianPhoneNumber" placeholder="เบอร์โทรศัพท์" disabled={!grant} focusNextField={3} />
        </Col>
        <Col md="2" className="pb-3">
          <Button
            onClick={onClick}
            size="sm"
            className="d-flex btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0"
          >
            {values.technicianId ? 'ข้อมูลช่างเพิ่มเติม' : 'เพิ่มรายชื่อ'} &rarr;
          </Button>
        </Col>
      </Row>
    </Fragment>
  );
};

export default TechnicianInForm;
