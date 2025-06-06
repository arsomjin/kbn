import React, { useState } from 'react';
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

const ForgetPasswordSchema = Yup.object().shape({
  email: Yup.string().email('อีเมลไม่ถูกต้อง').required('กรุณาป้อนอีเมล')
});

const ForgetPassword = ({ styles, handleConfirm, change }) => {
  const { resetPasswordError } = useSelector(state => state.auth);
  const [resetted, setResetted] = useState(null);

  const _onConfirm = values => {
    //  showLog('confirm', values);
    handleConfirm(values);
    setResetted(values.email);
  };

  return (
    <Fade triggerOnce direction="left" duration={500}>
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
            alt="Kubota Benjapol"
          />
        </Row>
        <Typography component="h1" variant="h5" style={{ color: '#fff', textAlign: 'center' }}>
          ลืมรหัสผ่าน
        </Typography>
        <Typography
          style={{
            color: 'lightGrey',
            textAlign: 'center',
            fontSize: '16px'
          }}
        >
          ระบบจะส่งลิงค์ชั่วคราวสำหรับเปลี่ยนรหัสผ่าน ไปยังอีเมลของคุณ
        </Typography>
        <Formik
          initialValues={{
            email: ''
          }}
          validationSchema={ForgetPasswordSchema}
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
              <InputField
                id="email"
                label="อีเมล"
                name="email"
                autoComplete="email@example.com"
                // autoFocus
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                preventAutoSubmit
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
                ยืนยัน
              </Button>
              {!!resetPasswordError && (
                <Typography
                  component="p"
                  style={{
                    color: '#ff669c',
                    marginTop: 5
                  }}
                >
                  {resetPasswordError}
                </Typography>
              )}
              {!!resetted && !resetPasswordError && (
                <Typography
                  component="p"
                  style={{
                    color: '#fff',
                    marginTop: 5
                  }}
                >
                  {`ระบบได้ส่งลิงค์การรีเซ็ตรหัสผ่าน ไปที่อีเมล ${resetted} เรียบร้อยแล้ว`}
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
                  change('Login');
                }}
                variant="body2"
                style={{ color: 'whitesmoke' }}
              >
                เข้าสู่ระบบ
              </Link>
            </Grid>
            <Grid item className="ml-4">
              <Link
                // href="#"
                variant="body2"
                style={{ color: 'whitesmoke' }}
                onClick={() => {
                  change('SignUp');
                }}
              >
                ลงทะเบียน
              </Link>
            </Grid>
          </Grid>
        </div>
      </div>
      <FooterContent />
    </Fade>
  );
};

export default ForgetPassword;
