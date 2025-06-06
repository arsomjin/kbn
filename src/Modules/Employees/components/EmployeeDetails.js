import React, { useCallback, useContext, useEffect, useState } from 'react';
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
  Button
} from 'shards-react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { validateMobileNumber } from 'functions';
import { TextInput } from 'elements';
import { showWarn } from 'functions';
import { setEmployees } from 'redux/actions/data';
import { showActionSheet } from 'functions';
import { showSuccess } from 'functions';
import { load } from 'functions';
import { Slide } from 'react-awesome-reveal';
import { SearchSelect } from 'elements';
import { Tambols, Provinces } from 'data/thaiTambol';
import { getAmphoesFromProvince } from 'data/thaiTambol';
import { getPostcodeFromProvince } from 'data/thaiTambol';
import { getTambolsFromAmphoe } from 'data/thaiTambol';
import { getChanges } from 'functions';
import { FirebaseContext } from '../../../firebase';
import { FInput } from 'Formiks';
import { showAlert } from 'api/AlertDialog/AlertManager';

const EmployeeSchema = Yup.object().shape({
  firstName: Yup.string().required('กรุณาป้อนชื่อ'),
  lastName: Yup.string().required('กรุณาป้อนนามสกุล'),
  employeeCode: Yup.string().required('กรุณาป้อนรหัสพนักงาน'),
  phoneNumber: Yup.string().test('test-name', 'กรุณาตรวจสอบ เบอร์โทรศัพท์', value => {
    // Allow empty string.
    return value && value.length > 0 ? validateMobileNumber(value) : true;
  })
});

const EmployeeDetails = ({ title, app, onCancel, selectedEmployee }) => {
  const { api, firestore } = useContext(FirebaseContext);

  const { userGroups, branches, employees } = useSelector(state => state.data);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [TAMBOLS, setTambols] = useState([]);
  const [AMPHOES, setAmphoes] = useState([]);
  const [PROVINCES, setProvinces] = useState(Provinces());
  const [POSTCODES, setPostcodes] = useState([]);

  const _getProvincesDB = useCallback(async () => {
    let mProvinces = Provinces().map(pv => ({
      value: pv.p,
      label: pv.p
    }));
    // Move korat to first element.
    mProvinces.forEach(function (item, i) {
      if (item.value === 'นครราชสีมา') {
        mProvinces.splice(i, 1);
        mProvinces.unshift(item);
      }
    });
    //  showLog({ origLen: Provinces().length, newLen: mProvinces.length });
    setProvinces(mProvinces);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 100);
    return () => window.scrollTo(0, 100);
  }, []);

  useEffect(() => {
    _getProvincesDB();
    _onProvinceSelect('นครราชสีมา');
  }, [_getProvincesDB]);

  const _onPreConfirm = values => {
    //  showLog('values', values);

    showActionSheet(() => _onConfirm(values), 'ยืนยัน?', `บันทึกข้อมูลของ ${values.firstName}`);
  };

  const _onProvinceSelect = async pv => {
    //  showLog('pv', pv);

    let mAmphoes = getAmphoesFromProvince(pv);
    mAmphoes = mAmphoes.map(ap => ({
      value: ap.a,
      label: ap.a
    }));
    let mPostcodes = getPostcodeFromProvince(pv);
    mPostcodes = mPostcodes.map(ap => ({
      value: ap.z,
      label: ap.z
    }));
    setAmphoes(mAmphoes);
    setPostcodes(mPostcodes);
  };

  const _onAmphoeSelect = async ap => {
    let mTambols = getTambolsFromAmphoe(ap);
    setTambols(mTambols);
  };

  const _onTambolSelect = (tb, values, setFieldValue) => {
    //  showLog({ tb, values });
    //  showLog({ Tambols });
    const { amphoe, province } = values;
    const pc = Tambols.findIndex(l => l.p === province && l.a === amphoe && l.d === tb);
    if (pc !== -1) {
      setFieldValue('postcode', Tambols[pc].z);
    }
  };

  const _onConfirm = async values => {
    // const {
    //   firstName,
    //   lastName,
    //   email,
    //   phoneNumber,
    //   group,
    //   branch,
    //   description,
    // } = values;
    try {
      load(true);
      const oldValues = JSON.parse(JSON.stringify(selectedEmployee));
      const newValues = values;
      // Update firestore.
      const employeeRef = firestore.collection('data').doc('company').collection('employees');
      let mEmployees = JSON.parse(JSON.stringify(employees));
      let type = 'editEmployee';
      let docId;
      if (selectedEmployee?.employeeCode) {
        // Update existing employee.
        docId = selectedEmployee.employeeCode;
        const docSnap = await employeeRef.doc(docId).get();
        if (docSnap.exists) {
          await employeeRef.doc(docId).update(values);
          mEmployees[docId] = {
            ...mEmployees[docId],
            ...values
          };
        }
      } else {
        // Add new employee.
        type = 'addEmployee';
        const { prefix, firstName, lastName, phoneNumber, employeeCode } = values;
        // Check duplicate employee.
        const cSnap = await employeeRef.where('firstName', '==', firstName).where('lastName', '==', lastName).get();
        if (!cSnap.empty) {
          load(false);
          return showAlert('มีชื่อในระบบแล้ว', `มีชื่อคุณ${firstName} ${lastName} อยู่ในระบบแล้ว`, 'warning');
        }

        if (!employeeCode) {
          return showAlert('ข้อมูลไม่ครบ', 'กรุณาป้อนรหัสพนักงาน', 'warning');
        }

        await employeeRef.doc(employeeCode).set({
          prefix,
          firstName,
          lastName,
          phoneNumber,
          created: Date.now(),
          employeeCode
        });
        mEmployees[employeeCode] = {
          employeeCode,
          prefix,
          firstName,
          lastName,
          phoneNumber,
          created: Date.now()
        };
        docId = employeeCode;
      }

      // Update redux store.
      dispatch(setEmployees(mEmployees));
      await api.updateData('employees', docId);
      // Add log.
      let changes = getChanges(oldValues, newValues);
      await api.addLog(
        {
          time: Date.now(),
          type: type === 'editEmployee' ? 'edited' : 'added',
          by: user.uid,
          docId,
          changes
        },
        'employees',
        type
      );

      load(false);
      showSuccess(() => onCancel(), 'บันทึกข้อมูลสำเร็จ');
    } catch (e) {
      showWarn(e);
      load(false);
    }
  };

  const grant = true;
  // user.isDev ||
  // (user.permissions && user.permissions.permission702) ||
  // user.uid === selectedEmployee.employeeCode;

  const displayName = `${
    selectedEmployee.firstName || selectedEmployee.lastName ? 'คุณ' : ''
  }${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`;

  // showLog('employee_detail_render');

  return (
    <Slide
      triggerOnce
      direction="right"
      duration={500}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50
        // backgroundColor: theme.colors.surface,
      }}
    >
      <Card small className="mb-4">
        <CardHeader className="border-bottom">
          <Row form style={{ justifyContent: 'space-between' }}>
            <Button onClick={() => onCancel()} className="btn-white">
              &larr; กลับ
            </Button>
            <h6 className="m-0 mr-3 text-primary">{selectedEmployee.employeeCode ? displayName : 'เพิ่มรายชื่อ'}</h6>
          </Row>
        </CardHeader>
        <ListGroup flush>
          <ListGroupItem className="p-3">
            <Row>
              <Col>
                <Formik
                  initialValues={{
                    prefix: selectedEmployee.prefix || 'นาย',
                    employeeCode: selectedEmployee.employeeCode || '',
                    firstName: selectedEmployee.firstName || '',
                    lastName: selectedEmployee.lastName || '',
                    phoneNumber: selectedEmployee.phoneNumber || '',
                    address: selectedEmployee.address || '',
                    tambol: selectedEmployee.tambol || '',
                    amphoe: selectedEmployee.amphoe || '',
                    province: selectedEmployee.province || 'นครราชสีมา',
                    postcode: selectedEmployee.postcode || '',
                    branch: selectedEmployee.branch || '0450',
                    remark: selectedEmployee.remark || ''
                  }}
                  validationSchema={EmployeeSchema}
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
                    isSubmitting,
                    setFieldValue
                    /* and other goodies */
                  }) => (
                    <Form>
                      <Row form>
                        <Col md="4" className="form-group">
                          <label>รหัสพนักงาน</label>
                          <FInput name="employeeCode" placeholder="รหัสพนักงาน" disabled={!grant} />
                        </Col>
                      </Row>
                      <Row form>
                        <Col md="2" className="form-group">
                          <label>คำนำหน้า</label>
                          <FormSelect
                            name="prefix"
                            error={errors.prefix}
                            value={values.prefix}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!grant}
                          >
                            <option>นาย</option>
                            <option>นาง</option>
                            <option>นางสาว</option>
                          </FormSelect>
                        </Col>
                        {/* ชื่อ */}
                        <Col md="4" className="form-group">
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
                        <Col md="4" className="form-group">
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
                        <Col md="2" className="form-group">
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
                      </Row>
                      <Row form>
                        <Col md="4" className="form-group">
                          <label>ที่อยู่</label>
                          <TextInput
                            type="text"
                            name="address"
                            placeholder="ที่อยู่"
                            error={errors.address}
                            value={values.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!grant}
                          />
                        </Col>
                        <Col md="4" className="form-group">
                          <label>จังหวัด</label>
                          <SearchSelect
                            id={'province'}
                            type={'text'}
                            placeholder="จังหวัด"
                            value={{
                              value: values.province,
                              label: values.province
                            }}
                            // inputValue={values.province}
                            error={errors.province}
                            onChange={val => {
                              //  showLog('select_province', val);
                              setFieldValue('province', val.value);
                              _onProvinceSelect(val.value);
                            }}
                            // onInputChange={(txt) => setQuery(txt)}
                            options={PROVINCES}
                            onBlur={handleBlur}
                          />
                          {/* <TextInput
                            type="text"
                            name="province"
                            placeholder="จังหวัด"
                            error={errors.province}
                            value={values.province}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!grant}
                          /> */}
                        </Col>
                      </Row>
                      <Row form>
                        <Col md="4" className="form-group">
                          <label>อำเภอ</label>
                          <SearchSelect
                            id={'amphoe'}
                            type={'text'}
                            placeholder="อำเภอ"
                            value={{
                              value: values.amphoe,
                              label: values.amphoe
                            }}
                            error={errors.amphoe}
                            onChange={val => {
                              setFieldValue('amphoe', val.value);
                              _onAmphoeSelect(val.value);
                            }}
                            // onInputChange={(txt) => setQuery(txt)}
                            options={AMPHOES}
                            onBlur={handleBlur}
                          />
                          {/* <TextInput
                            type="text"
                            name="amphoe"
                            placeholder="อำเภอ"
                            error={errors.amphoe}
                            value={values.amphoe}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!grant}
                          /> */}
                        </Col>
                        <Col md="4" className="form-group">
                          <label>ตำบล</label>
                          <SearchSelect
                            id={'tambol'}
                            type={'text'}
                            placeholder="ตำบล"
                            value={{
                              value: values.tambol,
                              label: values.tambol
                            }}
                            error={errors.tambol}
                            onChange={val => {
                              setFieldValue('tambol', val.value);
                              _onTambolSelect(val.value, values, setFieldValue);
                            }}
                            // onInputChange={(txt) => setQuery(txt)}
                            options={TAMBOLS}
                            onBlur={handleBlur}
                          />
                          {/* <TextInput
                            type="text"
                            name="tambol"
                            placeholder="ตำบล"
                            error={errors.tambol}
                            value={values.tambol}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!grant}
                          /> */}
                        </Col>
                        <Col md="4" className="form-group">
                          <label>รหัสไปรษณีย์</label>
                          <SearchSelect
                            id={'postcode'}
                            type={'text'}
                            placeholder="รหัสไปรษณีย์"
                            value={{
                              value: values.postcode,
                              label: values.postcode
                            }}
                            error={errors.postcode}
                            onChange={val => {
                              setFieldValue('postcode', val.value);
                            }}
                            // onInputChange={(txt) => setQuery(txt)}
                            options={POSTCODES}
                            onBlur={handleBlur}
                          />
                          {/* <TextInput
                            type="text"
                            name="postcode"
                            placeholder="รหัสไปรษณีย์"
                            error={errors.postcode}
                            value={values.postcode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!grant}
                          /> */}
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
                            disabled={!grant}
                          >
                            {Object.keys(branches).map(key => (
                              <option key={key} value={key}>
                                {branches[key].branchName}
                              </option>
                            ))}
                          </FormSelect>
                        </Col>
                      </Row>
                      <Row form>
                        {/* Remark */}
                        <Col md="12" className="form-group">
                          <label htmlFor="feRemark">หมายเหตุ</label>
                          <FormTextarea
                            name="remark"
                            rows="5"
                            error={errors.remark}
                            value={values.remark}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={!grant}
                          />
                        </Col>
                      </Row>
                      <Row form style={{ justifyContent: 'space-between' }}>
                        <Button onClick={() => onCancel()} className="btn-white">
                          &larr; กลับ
                        </Button>
                        <Button theme="accent" onClick={handleSubmit} disabled={!grant}>
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
    </Slide>
  );
};

EmployeeDetails.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string
};

EmployeeDetails.defaultProps = {
  title: 'Account Details'
};

export default EmployeeDetails;
