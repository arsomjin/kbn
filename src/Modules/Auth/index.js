import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgetPassword, loginUser, signUpUserWithRBAC } from '../../redux/actions/auth';

import NatureLogin from './NatureLogin';
import EnhancedSignUp from './EnhancedSignUp';
import ApprovalStatus from './ApprovalStatus';
import Load from 'elements/Load';
import ForgetPassword from './ForgetPassword';
import SimpleHelpButton from '../../components/SimpleHelpButton';
import welcomeImage from '../../images/office2.jpg';

const Auth = () => {
  const [currentView, setCurrentView] = useState('Login');
  const [pendingUserData, setPendingUserData] = useState(null);
  const [isMounted, setIsMounted] = useState(true);
  
  const { isLoggingIn } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Track component mount status
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleLogin = values => {
    const { email, password, rememberMe } = values;
    dispatch(loginUser(email, password, rememberMe));
  };

  const handleSignUp = async (values) => {
    try {
      const result = await dispatch(signUpUserWithRBAC(values));
      
      // For pending users, EnhancedSignUp will handle page reload
      // No need to change view here since page will reload
      
      // Return the result so EnhancedSignUp can handle it
      return result;
    } catch (error) {
      console.error('Signup error in Auth component:', error);
      throw error; // Re-throw so EnhancedSignUp can handle the error
    }
  };

  const handleForgetPassword = values => {
    dispatch(forgetPassword(values.email));
  };

  const changeView = scene => {
    setCurrentView(scene);
    if (scene === 'Login') {
      setPendingUserData(null); // Clear pending data when going back to login
    }
  };

  // Simplified - no need for complex event listening since we use page reload
  useEffect(() => {
    // Any cleanup or initialization can go here if needed
  }, [isMounted]);

  // Determine current scene based on view and loading state
  const getCurrentScene = () => {
    if (isLoggingIn) {
      return <Load loading />;
    }

    switch (currentView) {
      case 'Login':
        return <NatureLogin handleConfirm={handleLogin} change={changeView} />;
      case 'SignUp':
        return <EnhancedSignUp handleConfirm={handleSignUp} change={changeView} />;
      case 'ForgetPassword':
        return <ForgetPassword handleConfirm={handleForgetPassword} change={changeView} />;
      case 'ApprovalStatus':
        return <ApprovalStatus userData={pendingUserData} onBackToLogin={() => changeView('Login')} />;
      default:
        return <NatureLogin handleConfirm={handleLogin} change={changeView} />;
    }
  };

  // Get screen type for help button
  const getScreenType = () => {
    switch (currentView) {
      case 'Login':
        return 'login';
      case 'SignUp':
        return 'signup';
      case 'ForgetPassword':
        return 'forgot-password';
      default:
        return 'login';
    }
  };

  return (
    <div className="nature-login-page">
      {/* 🏢 Clean office background - Performance optimized! */}
      <div 
        className="nature-login-background" 
        style={{
          backgroundImage: `url(${welcomeImage})`,
          opacity: 0.8,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* 🌟 Simple glassmorphism overlay - Clean and efficient */}
      <div className="nature-glassmorphism-overlay"></div>
      
      {/* 🚀 LIQUID GLASS EFFECTS - SAVED FOR FUTURE ENTERPRISE UPGRADE! */}
      {/* Boss said: "One day we will come back and integrate this style!" */}
      {/* That day will be GLORIOUS! 🌊✨ */}
      
      {/* Main content container */}
      <div className="nature-login-container">
        <div className="nature-auth-card">
          {getCurrentScene()}
        </div>
      </div>
        
      {/* Simple Help Button */}
      <SimpleHelpButton 
        screenType={getScreenType()}
        autoShow={currentView === 'SignUp'}
      />
    </div>
  );
};

Auth.propTypes = {
  // No props needed
};

export default Auth; 