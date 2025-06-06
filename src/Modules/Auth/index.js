import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgetPassword, loginUser, signUpUser } from '../../redux/actions/auth';

import Blur from 'react-blur';
import Background from '../../images/office2.jpg';
import Login from './Login';
import SignUp from './SignUp';
import Load from 'elements/Load';
import ForgetPassword from './ForgetPassword';
import { capitalizeFirstLetter } from 'functions';
import { Container } from '@material-ui/core';
import { w } from 'api';

const styles = {
  global: {
    body: {
      backgroundColor: '#fff'
    }
  },
  paper: {
    marginTop: 100,
    display: 'flex',
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#f50057'
  },
  form: {
    marginTop: 1
  },
  errorText: {
    color: '#f50057',
    marginBottom: 5,
    textAlign: 'center'
  }
};

const Auth = ({ classes }) => {
  const { isAuthenticated, isLoggingIn } = useSelector(state => state.auth);
  const { device } = useSelector(state => state.global);

  const [currentView, setCurrentView] = useState('Login');
  const [ready, setReady] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const img = new Image();
    img.src = Background; // by setting an src, you trigger browser download

    img.onload = () => {
      // when it finishes loading, update the component state
      setReady(true);
    };
  }, []);

  const handleLogin = values => {
    const { email, password } = values;
    dispatch(loginUser(email, password));
  };

  const handleSignUp = values => {
    const { firstName, lastName, email, password } = values;
    dispatch(signUpUser(capitalizeFirstLetter(firstName), capitalizeFirstLetter(lastName), email, password));
  };

  const handleForgetPassword = values => {
    //  showLog('forget', values);
    dispatch(forgetPassword(values.email));
  };

  const change = scene => setCurrentView(scene);

  let currentScene = isLoggingIn ? (
    <Load loading />
  ) : (
    <Login styles={styles} handleConfirm={handleLogin} change={change} />
  );

  switch (currentView) {
    case 'Login':
      currentScene = <Login styles={styles} handleConfirm={handleLogin} change={change} />;
      break;
    case 'SignUp':
      currentScene = <SignUp styles={styles} handleConfirm={handleSignUp} change={change} />;
      break;
    case 'ForgetPassword':
      currentScene = <ForgetPassword styles={styles} handleConfirm={handleForgetPassword} change={change} />;
      break;

    default:
      break;
  }

  const AuthContainer = ({ children }) => {
    const isMobilePortrait = device.isMobile && device.orientation === 'portrait';
    const isMobileLandscape = device.isMobile && device.orientation === 'landscape';
    return (
      <Container
        component="main"
        maxWidth="xs"
        style={{
          backgroundColor: 'rgba(55,55,55,0.7)',
          paddingBottom: '20px',
          paddingTop: '20px',
          borderRadius: '10px',
          // marginTop: '100px',
          minWidth: 320,
          ...(isMobilePortrait && { width: w(90) }),
          ...(isMobileLandscape && { width: w(80) })
        }}
      >
        {children}
      </Container>
    );
  };

  return !ready ? (
    <Load loading />
  ) : (
    <div
      style={{
        // background: `url(${Background})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'grey'
        // zIndex: 9999,
      }}
    >
      <Blur
        img={Background}
        blurRadius={2}
        style={{
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -10
        }}
        enableStyles
      />
      {isLoggingIn ? (
        <Load loading />
      ) : (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <AuthContainer>{currentScene}</AuthContainer>
        </div>
      )}
    </div>
  );
};

export default Auth;
