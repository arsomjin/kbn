import React from 'react';
import { useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Col, Row } from 'shards-react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import InputField from './components/InputField';
import { Fade } from 'react-awesome-reveal';
import { FooterContent } from 'components/Footers';

const SignUpSchema = Yup.object().shape({
  firstName: Yup.string().required('กรุณาป้อนชื่อ'),
  lastName: Yup.string().required('กรุณาป้อนนามสกุล'),
  email: Yup.string().email('อีเมลไม่ถูกต้อง').required('กรุณาป้อนอีเมล'),
  password: Yup.string()
    .min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
    .max(20, 'ยาวเกินไป')
    .required('กรุณาป้อนรหัสผ่าน'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'รหัสผ่านไม่ตรงกัน')
    .min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
    .max(20, 'ยาวเกินไป')
    .required('กรุณายืนยันรหัสผ่าน')
});

const SignUp = ({ styles, handleConfirm, change }) => {
  const { signUpError } = useSelector(state => state.auth);

  const _onConfirm = values => {
    //  showLog('confirm', values);
    handleConfirm(values);
  };

  return (
    <Fade triggerOnce direction="right" duration={500}>
      {/* <CssBaseline /> */}
      <div style={styles.paper}>
        <Row style={{ justifyContent: 'center' }}>
          <img
            id="main-logo"
            className="d-inline-block align-top mr-1"
            style={{
              maxWidth: '88px',
              size: '82px',
              marginBottom: '20px'
            }}
            src={require('../../images/logo192.png')}
                            alt="KBN"
          />
        </Row>
        <Typography component="h1" variant="h5" style={{ color: '#fff', textAlign: 'center' }}>
          ลงทะเบียน
        </Typography>
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
          }}
          validationSchema={SignUpSchema}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              // alert(JSON.stringify(values, null, 2));
              //  showLog('values', values);
              _onConfirm(values);
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
            <form style={styles.form} noValidate>
              <Row>
                {/* ชื่อ */}
                <Col md="6">
                  <InputField
                    id="firstName"
                    label="ชื่อ"
                    name="firstName"
                    // autoFocus
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.firstName}
                    autoCap="words"
                  />
                </Col>
                {/* นามสกุล */}
                <Col md="6">
                  <InputField
                    id="lastName"
                    label="นามสกุล"
                    name="lastName"
                    // autoFocus
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.lastName}
                    autoCap="words"
                  />
                </Col>
              </Row>
              <InputField
                id="email"
                label="อีเมล"
                name="email"
                autoComplete="email@example.com"
                // autoFocus
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
              />
              <InputField
                name="password"
                label="รหัสผ่าน"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
              />
              <InputField
                name="confirmPassword"
                label="ยืนยันรหัสผ่าน"
                type="password"
                id="confirmPassword"
                autoComplete="current-password"
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                lastField
              />
              <Button
                // type="submit"
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                style={{
                  ...styles.submit,
                  backgroundColor: '#4682b4',
                  marginTop: '20px'
                }}
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                ลงทะเบียน
              </Button>
              {!!signUpError && (
                <Typography
                  component="p"
                  style={{
                    color: '#ff669c',
                    marginTop: 5
                  }}
                >
                  {signUpError}
                </Typography>
              )}
            </form>
          )}
        </Formik>
        <div style={{ marginTop: '20px' }}>
          <Grid container>
            <Grid item xs>
              <Link
                variant="body2"
                style={{ color: 'whitesmoke' }}
                onClick={() => {
                  change('Login');
                }}
              >
                มีบัญชีอยู่แล้ว?
              </Link>
            </Grid>
            {/* <Grid item>
                      <Link
                        href="#"
                        variant="body2"
                        style={{ color: 'whitesmoke' }}
                      >
                        {'ยังไม่มีบัญชีผู้ใช้งาน? ลงทะเบียน'}
                      </Link>
                    </Grid> */}
          </Grid>
        </div>
      </div>
      <FooterContent />
    </Fade>
  );
};

export default SignUp;
