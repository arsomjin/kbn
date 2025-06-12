import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
  FormSelect,
  FormTextarea,
} from 'shards-react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { validateMobileNumber } from 'functions';
import { TextInput } from 'elements';
import { showWarn } from 'functions';
import { setUsers } from 'redux/actions/data';
import { showActionSheet } from 'functions';
import { showSuccess } from 'functions';
import { load } from 'functions';
import FSelect from 'Formiks/FSelect';
import { cleanValuesBeforeSave } from 'functions';
import { errorHandler } from 'functions';
import { useLocation } from 'react-router-dom';
import { 
  getUserId, 
  getUserFirstName, 
  getUserLastName, 
  getUserEmail, 
  getUserPhoneNumber, 
  getUserHomeBranch,
  getUserDisplayName,
  safeUserUpdate 
} from 'utils/user-structure-safety';

const UserSchema = Yup.object().shape({
  firstName: Yup.string().required('กรุณาป้อนชื่อ'),
  lastName: Yup.string().required('กรุณาป้อนนามสกุล'),
  email: Yup.string().email('อีเมลไม่ถูกต้อง').required('กรุณาป้อนอีเมล'),
  phoneNumber: Yup.string().test('test-name', 'กรุณาตรวจสอบ เบอร์โทรศัพท์', value => {
    // Allow empty string.
    return value && value.length > 0 ? validateMobileNumber(value) : true;
  })
});

const UserAccountDetails = ({ title, app, api, onCancel, selectedUser }) => {
  const { userGroups, branches, users, departments } = useSelector(state => state.data);
  const dispatch = useDispatch();
  let location = useLocation();
  //  showLog('location', location.pathname);
  const isUserProfile = location.pathname === '/user-profile';

  const _onPreConfirm = values => {
    // showLog('values', values);

    showActionSheet(() => _onConfirm(values), 'ยืนยัน?', `บันทึกข้อมูลของคุณ ${values.firstName}`);
  };

  const _onConfirm = async values => {
    const {
      // prefix,
      firstName,
      lastName,
      email,
      phoneNumber,
      group,
      branch,
      description,
      department,
      status
    } = values;
    try {
      load(true);
      
      // Use safety utility to get user ID
      const docId = getUserId(selectedUser);
      
      if (!docId) {
        throw new Error('Unable to identify user document ID. User data structure may be invalid.');
      }
      
      // Update Firebase Auth profile if it's the current user
      const currentUser = app.auth().currentUser;
      if (currentUser && currentUser.uid === docId) {
        await currentUser.updateProfile({
          displayName: `${firstName} ${lastName}`,
          email,
          phoneNumber
        });
      }
      
      // Prepare update data - this will go to the appropriate structure location
      const updateData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        displayName: `${firstName} ${lastName}`,
        group,
        description,
        branch,
        department,
        status
      };
      
      // Use safe update utility to handle both Clean Slate and legacy structures
      const userRef = app.firestore().collection('users').doc(docId);
      await safeUserUpdate(userRef, updateData);

      // Note: Redux state will be automatically updated by the real-time listener
      // No need to manually dispatch or refresh cache

      load(false);
      showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
    } catch (e) {
      showWarn(e);
      load(false);
      errorHandler({
        code: e?.code || '',
        message: e?.message || '',
        snap: {
          ...cleanValuesBeforeSave(values),
          module: 'UserAccountDetails'
        }
      });
    }
  };

  // const grant =
  //   user.isDev ||
  //   (user.permissions && user.permissions.permission702) ||
  //   user.uid === selectedUser._key;

  const grant = true;

  return (
    <Card small className="mb-4">
      <CardHeader className="border-bottom">
        <h6 className="m-0">{getUserDisplayName(selectedUser)}</h6>
      </CardHeader>
      <ListGroup flush>
        <ListGroupItem className="p-3">
          <Row>
            <Col>
              <Formik
                initialValues={{
                  // prefix: selectedUser.prefix || 'นาย',
                  firstName: getUserFirstName(selectedUser),
                  lastName: getUserLastName(selectedUser),
                  email: getUserEmail(selectedUser),
                  phoneNumber: getUserPhoneNumber(selectedUser),
                  group: selectedUser.group || 'group011',
                  branch: getUserHomeBranch(selectedUser) || '0450',
                  description: selectedUser.description || '',
                  department: selectedUser.department || '',
                  status: selectedUser.status || 'ปกติ'
                }}
                validationSchema={UserSchema}
                onSubmit={(values, { setSubmitting }) => {
                  setTimeout(() => {
                    // alert(JSON.stringify(values, null, 2));
                    _onPreConfirm(values);
                    setSubmitting(false);
                  }, 400);
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting
                  /* and other goodies */
                }) => (
                  <Form>
                    <Row form>
                      {/* ชื่อ */}
                      {/* <Col md="2" className="form-group">
                        <label>คำนำหน้า</label>
                        <FormSelect
                          name="group"
                          error={errors.group}
                          value={values.group}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!grant}
                        >
                          {['นาย', 'นาง', 'นางสาว'].map((key) => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </FormSelect>
                      </Col> */}
                      <Col md="6" className="form-group">
                        <label>ชื่อ</label>
                        <TextInput
                          name="firstName"
                          placeholder="ชื่อ"
                          error={errors.firstName}
                          value={values.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!grant}
                        />
                      </Col>
                      {/* นามสกุล */}
                      <Col md="6" className="form-group">
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
                      </Col>
                    </Row>
                    <Row form>
                      {/* อีเมล */}
                      <Col md="6" className="form-group">
                        <label>อีเมล</label>
                        <TextInput
                          type="email"
                          name="email"
                          placeholder="อีเมล"
                          error={errors.email}
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="email"
                          disabled={!grant}
                        />
                      </Col>
                      <Col md="6" className="form-group">
                        <label>เบอร์โทร</label>
                        <TextInput
                          type="text"
                          name="phoneNumber"
                          placeholder="เบอร์โทร"
                          error={errors.phoneNumber}
                          value={values.phoneNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!grant}
                        />
                      </Col>
                      {/* Password */}
                      {/* <Col md="6" className="form-group">
                  <label htmlFor="fePassword">Password</label>
                  <TextInput
                    type="password"
                    id="fePassword"
                    placeholder="Password"
                    value="EX@MPL#P@$$w0RD"
                    onChange={handleChange}
                          onBlur={handleBlur}
                    autoComplete="current-password"
                  />
                </Col> */}
                    </Row>
                    <Row form>
                      <Col md="6" className="form-group">
                        <label>ระดับ</label>
                        <FormSelect
                          name="group"
                          error={errors.group}
                          value={values.group}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!grant || isUserProfile}
                        >
                          {Object.keys(userGroups).map(key => (
                            <option key={key} value={key}>
                              {userGroups[key].userGroupName}
                            </option>
                          ))}
                        </FormSelect>
                      </Col>
                      <Col md="6" className="form-group">
                        <label>แผนก</label>
                        <FSelect
                          name="department"
                          initialWords="แผนก"
                          // defaultValue={values.department}
                          disabled={!grant || isUserProfile}
                        >
                          {Object.keys(departments).map(key => (
                            <option key={key} value={key}>
                              {departments[key].department}
                            </option>
                          ))}
                        </FSelect>
                      </Col>
                    </Row>
                    <Row form>
                      <Col md="6" className="form-group">
                        <label>สาขา</label>
                        <FormSelect
                          name="branch"
                          error={errors.branch}
                          value={values.branch}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!grant || isUserProfile}
                        >
                          {Object.keys(branches).map(key => (
                            <option key={key} value={key}>
                              {branches[key].branchName}
                            </option>
                          ))}
                        </FormSelect>
                      </Col>
                      <Col md="6" className="form-group">
                        <label>สถานภาพ</label>
                        <FormSelect
                          name="status"
                          error={errors.status}
                          value={values.status}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled
                          className={values.status === 'ปกติ' ? 'text-success' : 'text-danger'}
                        >
                          {['ปกติ', 'ลาออก'].map(key => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </FormSelect>
                      </Col>
                    </Row>
                    <Row form>
                      {/* Description */}
                      <Col md="12" className="form-group">
                        <label htmlFor="feDescription">Description</label>
                        <FormTextarea
                          name="description"
                          rows="5"
                          error={errors.description}
                          value={values.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={!grant}
                        />
                      </Col>
                    </Row>
                    <Row form style={{ justifyContent: 'space-between' }}>
                      <Button onClick={() => onCancel()} >
                        &larr; กลับ
                      </Button>
                      <Button type="primary" onClick={handleSubmit} disabled={!grant}>
                        บันทึกข้อมูล
                      </Button>
                    </Row>
                  </Form>
                )}
              </Formik>
            </Col>
          </Row>
        </ListGroupItem>
      </ListGroup>
    </Card>
  );
};

UserAccountDetails.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * Firebase app instance
   */
  app: PropTypes.object.isRequired,
  /**
   * API utilities
   */
  api: PropTypes.object.isRequired,
  /**
   * Cancel callback function
   */
  onCancel: PropTypes.func.isRequired,
  /**
   * Selected user object
   */
  selectedUser: PropTypes.object.isRequired
};

UserAccountDetails.defaultProps = {
  title: 'Account Details'
};

export default UserAccountDetails;
