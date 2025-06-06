import React from 'react';
import { useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Row } from 'shards-react';
import { Fade } from 'react-awesome-reveal';

import { Formik } from 'formik';
import * as Yup from 'yup';
import InputField from './components/InputField';
import { FooterContent } from 'components/Footers';

const LoginSchema = Yup.object().shape({
  // firstName: Yup.string().required('กรุณาป้อนชื่อ'),
  email: Yup.string().email('อีเมลไม่ถูกต้อง').required('กรุณาป้อนอีเมล'),
  password: Yup.string()
    .min(6, 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
    .max(20, 'ยาวเกินไป')
    .required('กรุณาป้อนรหัสผ่าน')
});

const Login = ({ styles, handleConfirm, change }) => {
  const { loginError } = useSelector(state => state.auth);

  const _onConfirm = values => {
    //  showLog('confirm', values);
    handleConfirm(values);
  };

  // showLog('deviceWidth', w(100));

  return (
    <Fade triggerOnce direction="up" duration={500}>
      {/* <CssBaseline /> */}
      <div style={styles.paper}>
        <Row style={{ justifyContent: 'center' }}>
          <img
            id="main-logo"
            className="d-inline-block align-top mr-1"
            style={{
              maxWidth: '88px',
              size: '82px',
              height: '82px',
              marginBottom: '20px'
            }}
            src={require('../../images/logo192.png')}
            alt="Kubota Benjapol"
          />
        </Row>
        <Typography component="h1" variant="h5" style={{ color: '#fff', textAlign: 'center' }}>
          เข้าสู่ระบบ
        </Typography>
        <Formik
          initialValues={{
            // firstName: '',
            email: '',
            password: ''
          }}
          validationSchema={LoginSchema}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              // alert(JSON.stringify(values, null, 2));
              //  showLog('values', values);
              setSubmitting(false);
              _onConfirm(values);
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
                เข้าสู่ระบบ
              </Button>
              {!!loginError && (
                <Typography
                  component="p"
                  style={{
                    color: '#ff669c',
                    marginTop: 5
                  }}
                >
                  {loginError}
                </Typography>
              )}
            </form>
          )}
        </Formik>
        <div style={{ marginTop: '20px' }}>
          <Grid container>
            <Grid item xs className="mr-4">
              <Link
                onClick={() => {
                  change('ForgetPassword');
                }}
                variant="body2"
                style={{ color: 'whitesmoke' }}
              >
                ลืมรหัสผ่าน?
              </Link>
            </Grid>
            <Grid item>
              <Link
                // href="#"
                variant="body2"
                style={{ color: 'whitesmoke' }}
                onClick={() => {
                  change('SignUp');
                }}
              >
                {'ยังไม่มีบัญชีผู้ใช้งาน?'}
              </Link>
            </Grid>
          </Grid>
        </div>
      </div>
      <FooterContent />
    </Fade>
  );
};

export default Login;
