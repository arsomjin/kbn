import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Row,
  Col,
  // Form,
  Button
} from 'shards-react';
import { Form, Input as AInput } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { showLog } from 'functions';
import { showWarn } from 'functions';
import { setEmployees } from 'redux/actions/data';
import { showActionSheet } from 'functions';
import { showSuccess } from 'functions';
import { load } from 'functions';
import { showAlert } from 'functions';
import { uniq } from 'lodash';
import PrefixAnt from 'components/PrefixAnt';
import { Input } from 'elements';
import CommonSelector from 'components/CommonSelector';
import { DatePicker } from 'elements';
import { getRules } from 'api/Table';
import { cleanValuesBeforeSave } from 'functions';
import { ExtraPositions } from 'data/Constant';

const EmployeeSchema = Yup.object().shape({
  firstName: Yup.string().required('กรุณาป้อนชื่อ'),
  lastName: Yup.string().required('กรุณาป้อนนามสกุล'),
  position: Yup.string().required('กรุณาป้อนตำแหน่ง'),
  employeeCode: Yup.string().required('กรุณาป้อนรหัสพนักงาน'),
  status: Yup.string().required('กรุณาป้อนสถานภาพ'),
  affiliate: Yup.string().required('กรุณาป้อนสาขา')
});

const EmployeeAccountDetails = ({ title, app, api, onCancel, selectedEmployee, isEdit }) => {
  showLog({ isEdit, selectedEmployee });
  const { employees, branches } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [positions, setPos] = useState([]);

  useEffect(() => {
    let arr = Object.keys(employees)
      .map(k => employees[k].position)
      .filter(l => !!l);
    arr = arr.concat(ExtraPositions);
    arr = uniq(arr);
    setPos(arr);
  }, [employees]);

  const AFFILIATES = Object.keys(branches).map(k => branches[k].branchName);

  // const AFFILIATES = uniq(
  //   Object.keys(employees)
  //     .map((k) => employees[k].affiliate)
  //     .filter((l) => !!l)
  // );

  const _onPreConfirm = async values => {
    try {
      let vValues = await form.validateFields();
      if (!values.employeeCode) {
        return showAlert('ข้อมูลไม่ครบ', 'กรุณาป้อนรหัสพนักงาน', 'warning');
      }
      showActionSheet(() => _onConfirm(values), 'ยืนยัน?', `บันทึกข้อมูลของคุณ ${values.firstName}`);
    } catch (e) {
      showWarn(e);
    }
  };

  const _onConfirm = async values => {
    const {
      prefix,
      firstName,
      lastName,
      employeeCode,
      status,
      nickName,
      position,
      affiliate,
      workBegin,
      workEnd,
      startDate,
      endDate
    } = values;
    try {
      load(true);
      // Update firestore.

      const employeeRef = app.firestore().collection('data/company/employees');

      if (isEdit) {
        const docSnap = await employeeRef.doc(selectedEmployee._key || selectedEmployee.employeeCode).get();
        if (docSnap.exists) {
          let updateSnap = {
            ...docSnap.data(),
            prefix,
            firstName,
            lastName,
            employeeCode,
            status,
            nickName,
            position,
            affiliate,
            workBegin,
            workEnd,
            startDate,
            endDate
          };
          updateSnap = cleanValuesBeforeSave(updateSnap);
          await employeeRef.doc(selectedEmployee._key || selectedEmployee.employeeCode).update(updateSnap);
        } else {
          load(false);
          return showAlert(
            'ANOMALY',
            `No data snap at data/company/employees/${selectedEmployee._key || selectedEmployee.employeeCode}`,
            'warning'
          );
        }
      } else {
        // Check duplicate employee.
        const cSnap = await employeeRef.where('firstName', '==', firstName).where('lastName', '==', lastName).get();
        if (!cSnap.empty) {
          load(false);
          return showAlert('มีชื่อในระบบแล้ว', `มีชื่อคุณ${firstName} ${lastName} อยู่ในระบบแล้ว`, 'warning');
        }
        let addSnap = {
          prefix,
          firstName,
          lastName,
          employeeCode,
          status,
          nickName,
          position,
          affiliate,
          workBegin,
          workEnd,
          startDate,
          endDate,
          created: Date.now(),
          inputBy: user.uid
        };

        addSnap = cleanValuesBeforeSave(addSnap);
        await employeeRef.doc(selectedEmployee.employeeCode || employeeCode).set(addSnap);
      }

      // Update redux store.
      let mEmployees = JSON.parse(JSON.stringify(employees));
      mEmployees[selectedEmployee.employeeCode || employeeCode] = {
        ...mEmployees[selectedEmployee.employeeCode || employeeCode],
        ...values
      };
      // Update data
      dispatch(setEmployees(mEmployees));
      await api.updateData('employees');

      load(false);
      showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  // const grant =
  //   user.isDev ||
  //   (user.permissions && user.permissions.permission702) ||
  //   user.employeeCode === selectedEmployee.employeeCode || employeeCode;

  const grant = true;

  return (
    <Form
      form={form}
      initialValues={{
        prefix: selectedEmployee.prefix || 'นาย',
        firstName: selectedEmployee.firstName || '',
        lastName: selectedEmployee.lastName || '',
        employeeCode: selectedEmployee.employeeCode || '',
        status: selectedEmployee.status || '',
        nickName: selectedEmployee.nickName || '',
        position: selectedEmployee.position || '',
        affiliate: selectedEmployee.affiliate || '',
        description: selectedEmployee.description || '',
        workBegin: selectedEmployee.workBegin || undefined,
        workEnd: selectedEmployee.workEnd || undefined,
        startDate: selectedEmployee.startDate || undefined,
        endDate: selectedEmployee.endDate || undefined
      }}
      layout="vertical"
      // size="small"
    >
      {values => {
        return (
          <Card small className="p-4">
            <Row>
              {/* ชื่อ */}
              <Col md="3">
                <Form.Item name="prefix" label="คำนำหน้า" rules={getRules(['required'])}>
                  <PrefixAnt disabled={!grant} onlyPerson />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="firstName" label="ชื่อ" rules={getRules(['required'])}>
                  <Input disabled={!grant} />
                </Form.Item>
              </Col>
              {/* นามสกุล */}
              <Col md="5">
                <Form.Item name="lastName" label="นามสกุล" rules={getRules(['required'])}>
                  <Input disabled={!grant} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <Form.Item name="nickName" label="ชื่อเล่น">
                  <Input disabled={!grant} />
                </Form.Item>
              </Col>
              {/* นามสกุล */}
              <Col md="4">
                <Form.Item name="employeeCode" label="รหัสพนักงาน" rules={getRules(['required'])}>
                  <Input disabled={!grant} />
                </Form.Item>
              </Col>
              <Col md="4">
                <Form.Item name="status" label="สถานภาพ" rules={getRules(['required'])}>
                  <CommonSelector
                    optionData={['ปกติ', 'ลาออก']}
                    disabled={!grant}
                    placeholder="สถานภาพ"
                    className={values?.status === 'ปกติ' ? 'text-success' : 'text-danger'}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <Form.Item name="position" label="ตำแหน่ง" rules={getRules(['required'])}>
                  <CommonSelector optionData={positions} disabled={!grant} />
                </Form.Item>
              </Col>
              <Col md="6">
                <Form.Item name="affiliate" label="สาขา" rules={getRules(['required'])}>
                  <CommonSelector optionData={AFFILIATES} disabled={!grant} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <Form.Item name="startDate" label="วันที่เริ่มงาน" rules={getRules(['required'])}>
                  <DatePicker disabled={!grant} />
                </Form.Item>
              </Col>
              {values.status === 'ลาออก' && (
                <Col md="6">
                  <Form.Item
                    name="endDate"
                    label="วันที่พ้นสภาพพนักงาน"
                    {...(values.status === 'ลาออก' && {
                      rules: getRules(['required'])
                    })}
                  >
                    <DatePicker disabled={!grant} />
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Row>
              <Col md="6">
                <Form.Item name="workBegin" label="เข้างาน" rules={getRules(['required'])}>
                  <DatePicker picker="time" disabled={!grant} />
                </Form.Item>
              </Col>
              <Col md="6">
                <Form.Item name="workEnd" label="เลิกงาน" rules={getRules(['required'])}>
                  <DatePicker picker="time" disabled={!grant} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Item name="description" label="รายละเอียดเพิ่มเติม">
                  <AInput.TextArea disabled={!grant} />
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ justifyContent: 'space-between' }} className="mx-1">
              <Button onClick={() => onCancel()} className="btn-white">
                &larr; กลับ
              </Button>
              <Button theme="accent" onClick={() => _onPreConfirm(values)} disabled={!grant}>
                บันทึกข้อมูล
              </Button>
            </Row>
            {/* <Footer
                onConfirm={() => _onPreConfirm(values)}
                onCancel={() => form.resetFields()}
                cancelText="ล้างข้อมูล"
                cancelPopConfirmText="ล้าง?"
                okPopConfirmText="ยืนยัน?"
                okIcon={<PlusOutlined />}
              /> */}
          </Card>
        );
      }}
    </Form>
  );
};

EmployeeAccountDetails.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string
};

EmployeeAccountDetails.defaultProps = {
  title: 'Account Details'
};

export default EmployeeAccountDetails;
