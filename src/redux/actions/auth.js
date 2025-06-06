import { updateData } from 'firebase/api';
import { getAuthErrorMessage } from 'Modules/Auth/api';
import { getFirebaseUserFromObject } from 'Modules/Auth/api';
import { app } from '../../firebase';

export const SIGNUP_REQUEST = 'SIGNUP_REQUEST';
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
export const RESET_PASSWORD_FAILURE = 'RESET_PASSWORD_FAILURE';

export const VERIFY_REQUEST = 'VERIFY_REQUEST';
export const VERIFY_SUCCESS = 'VERIFY_SUCCESS';

export const USER_UPDATE = 'USER_UPDATE';

const requestSignUp = () => {
  return {
    type: SIGNUP_REQUEST
  };
};

const receiveSignUp = user => {
  console.log('user_receive', user);
  let currentUser = app.auth().currentUser;
  currentUser
    .updateProfile({
      displayName: user.displayName
    })
    .then(() => {
      app.firestore().collection('users').doc(user.uid).set({ auth: user });
    })
    .then(() => {
      updateData('users');
    });
  return {
    type: SIGNUP_SUCCESS,
    user
  };
};

const signUpError = error => {
  return {
    type: SIGNUP_FAILURE,
    error
  };
};

const requestLogin = () => {
  return {
    type: LOGIN_REQUEST
  };
};

const receiveLogin = user => {
  const userRef = app.firestore().collection('users').doc(user.uid);
  userRef.get().then(docSnap => {
    if (docSnap.exists) {
      userRef.update({ auth: { ...docSnap.data().auth, ...user } });
    }
  });
  return {
    type: LOGIN_SUCCESS,
    user
  };
};

const loginError = error => {
  return {
    type: LOGIN_FAILURE,
    error
  };
};

const requestResetPassword = () => {
  return {
    type: RESET_PASSWORD_REQUEST
  };
};

const receiveResetPassword = () => {
  return {
    type: RESET_PASSWORD_SUCCESS
  };
};

const resetPasswordError = error => {
  return {
    type: RESET_PASSWORD_FAILURE,
    error
  };
};

const requestLogout = () => {
  return {
    type: LOGOUT_REQUEST
  };
};

const receiveLogout = () => {
  return {
    type: LOGOUT_SUCCESS
  };
};

const logoutError = error => {
  return {
    type: LOGOUT_FAILURE,
    error
  };
};

const verifyRequest = () => {
  return {
    type: VERIFY_REQUEST
  };
};

export const verifySuccess = () => {
  return {
    type: VERIFY_SUCCESS
  };
};

export const signUpUser = (firstName, lastName, email, password) => dispatch => {
  dispatch(requestSignUp());
  app
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(user => {
      let mUser = getFirebaseUserFromObject(user);
      mUser = {
        ...mUser,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        password,
        created: Date.now(),
        lastLogin: Date.now()
      };
      dispatch(receiveSignUp(mUser));
    })
    .catch(error => {
      //Do something with the error if you want!
      console.warn(error);
      const errorMsg = getAuthErrorMessage(error);
      dispatch(signUpError(errorMsg));
    });
};

export const loginUser = (email, password) => dispatch => {
  dispatch(requestLogin());
  app
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(user => {
      let mUser = getFirebaseUserFromObject(user);
      mUser = { ...mUser, password, lastLogin: Date.now() };
      dispatch(receiveLogin(mUser));
    })
    .catch(error => {
      //Do something with the error if you want!
      console.warn(error);
      const errorMsg = getAuthErrorMessage(error);
      dispatch(loginError(errorMsg));
    });
};

export const logoutUser = () => dispatch => {
  dispatch(requestLogout());
  app
    .auth()
    .signOut()
    .then(() => dispatch(receiveLogout()))
    .catch(error => {
      //Do something with the error if you want!
      console.warn(error);
      const errorMsg = getAuthErrorMessage(error);
      dispatch(logoutError(errorMsg));
    });
};

export const forgetPassword = email => dispatch => {
  dispatch(requestResetPassword());
  app
    .auth()
    .sendPasswordResetEmail(email)
    .then(() => {
      dispatch(receiveResetPassword());
    })
    .catch(error => {
      //Do something with the error if you want!
      console.warn(error);
      const errorMsg = getAuthErrorMessage(error);
      dispatch(resetPasswordError(errorMsg));
    });
};

export const verifyAuth = () => dispatch => {
  dispatch(verifyRequest());
  app.auth().onAuthStateChanged(user => {
    if (user !== null) {
      let mUser = getFirebaseUserFromObject(user);
      dispatch(receiveLogin(mUser));
    }
    dispatch(verifySuccess());
  });
};

export const updateUser = user => {
  return {
    type: USER_UPDATE,
    user
  };
};
