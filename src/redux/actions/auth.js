import { updateData, getProvinces } from 'firebase/api';
import { getFirebaseUserFromObject } from 'Modules/Auth/api';
import { app } from '../../firebase';
import { setProvinces } from './provinces';
import FirebaseErrorHandler from '../../utils/firebaseErrorHandler';

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

/**
 * Helper function to validate Clean Slate user structure
 * @param {Object} user - User object to validate
 * @returns {boolean} - True if valid Clean Slate structure
 */
const isValidCleanSlateUser = (user) => {
  return !!(
    user?.access?.authority && 
    user?.access?.geographic && 
    Array.isArray(user?.access?.departments)
  );
};

/**
 * Helper function to handle user status validation
 * @param {Object} userData - User data from Firestore
 * @returns {Object} - Status validation result
 */
const validateUserStatus = (userData) => {
  const isApproved = userData.isApproved !== false;
  const isActive = userData.isActive !== false;
  const approvalStatus = userData.approvalStatus || 'approved';
  
  return {
    isApproved,
    isActive,
    approvalStatus,
    isPending: !isApproved || approvalStatus === 'pending',
    isRejected: !isActive && approvalStatus === 'rejected',
    isSuspended: !isActive && approvalStatus === 'suspended'
  };
};

/**
 * SIGNUP SUCCESS - Clean Slate Only
 * For Clean Slate users, no Firestore update needed as it's done in signUpUserWithRBAC
 */
const receiveSignUp = user => {
  console.log('✅ Clean Slate user signup success:', user.uid);
  
  // Validate Clean Slate structure
  if (!isValidCleanSlateUser(user)) {
    console.error('🚨 Invalid Clean Slate user structure in signup:', user.uid);
    throw new Error('Invalid user structure - Clean Slate format required');
  }
  
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

/**
 * LOGIN SUCCESS - Clean Slate Only
 * No legacy auth structure updates
 */
const receiveLogin = (user, from) => {
  console.log('[receiveLogin] user:', user);
  console.log('[receiveLogin] from:', from);
  
  // Handle pending approval users (may not have complete Clean Slate structure yet)
  if (user.isPendingApproval) {
    console.log('⏳ Pending approval user login:', user.uid);
    return {
      type: LOGIN_SUCCESS,
      user
    };
  }
  
  // For Clean Slate users, validate structure
  if (isValidCleanSlateUser(user)) {
    console.log('✅ Clean Slate user login success:', user.uid);
    return {
      type: LOGIN_SUCCESS,
      user
    };
  }
  
  console.error('🚨 Invalid user structure in login:', user);
  throw new Error('Invalid user structure - migration required');
};

const loginError = error => {
  return {
    type: LOGIN_FAILURE,
    error
  };
};

const requestSignUp = () => ({ type: SIGNUP_REQUEST });
const requestLogin = () => ({ type: LOGIN_REQUEST });
const requestResetPassword = () => ({ type: RESET_PASSWORD_REQUEST });
const receiveResetPassword = () => ({ type: RESET_PASSWORD_SUCCESS });
const resetPasswordError = error => ({ type: RESET_PASSWORD_FAILURE, error });
const requestLogout = () => ({ type: LOGOUT_REQUEST });
const receiveLogout = () => ({ type: LOGOUT_SUCCESS });
const logoutError = error => ({ type: LOGOUT_FAILURE, error });
const verifyRequest = () => ({ type: VERIFY_REQUEST });

export const verifySuccess = () => ({ type: VERIFY_SUCCESS });

/**
 * LEGACY SIGNUP - Deprecated
 * This function is kept for backward compatibility but should not be used
 * Use signUpUserWithRBAC instead
 */
export const signUpUser = (firstName, lastName, email, password) => dispatch => {
  console.warn('⚠️ Legacy signUpUser called - use signUpUserWithRBAC instead');
  dispatch(requestSignUp());
  
  app.auth()
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
        lastLogin: Date.now(),
        requiresMigration: true // Flag for migration
      };
      dispatch(receiveSignUp(mUser));
    })
    .catch(error => {
      console.warn(error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(signUpError(errorInfo.message));
    });
};

/**
 * ENHANCED SIGNUP WITH CLEAN SLATE RBAC
 * Creates users with Clean Slate structure only using unified helpers
 */
export const signUpUserWithRBAC = (userData) => dispatch => {
  dispatch(requestSignUp());
  
  const {
    firstName,
    lastName,
    email,
    password,
    province,
    department,
    branch,
    userType,
    requestType,
    employeeId,
    registrationSource,
    needsManagerApproval,
    approvalLevel
  } = userData;

  return app.auth()
    .createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      
      try {
        // Import Clean Slate helpers
        const { createCleanSlateUser, createApprovalRequest, validateCleanSlateUser } = 
          await import('../../utils/clean-slate-helpers');
        
        // Create Clean Slate user structure using unified helper
        const cleanSlateUser = createCleanSlateUser({
          uid: user.uid,
          email: user.email,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          department,
          accessLevel: 'STAFF', // New users start as STAFF
          province,
          branch,
          userType
        });
        
        // Validate Clean Slate structure
        const validation = validateCleanSlateUser(cleanSlateUser);
        if (!validation.isValid) {
          throw new Error(`Invalid Clean Slate user structure: ${validation.errors.join(', ')}`);
        }
        
        console.log('✅ Clean Slate user structure created and validated:', {
          uid: cleanSlateUser.uid,
          authority: cleanSlateUser.access?.authority,
          geographic: cleanSlateUser.access?.geographic?.scope,
          departments: cleanSlateUser.access?.departments
        });

        // Create final user profile for Firestore (use Clean Slate structure directly)
        const userProfile = {
          // Essential user data
          uid: user.uid,
          email: user.email,
          displayName: cleanSlateUser.displayName,
          firstName: cleanSlateUser.firstName,
          lastName: cleanSlateUser.lastName,
          
          // Clean Slate RBAC structure (from unified helper)
          access: cleanSlateUser.access,
          
          // User metadata
          userType: cleanSlateUser.userType,
          employeeId: employeeId || null,
          
          // Status tracking
          isActive: cleanSlateUser.isActive,
          isApproved: cleanSlateUser.isApproved,
          approvalStatus: cleanSlateUser.approvalStatus,
          
          // System metadata
          isDev: false,
          created: Date.now(),
          updatedAt: Date.now(),
          createdAt: cleanSlateUser.createdAt,
          migrationType: cleanSlateUser.migrationType
        };

        // Update Firebase Auth profile
        await user.updateProfile({
          displayName: userProfile.displayName
        });

        // Save to Firestore with unified Clean Slate structure
        await app.firestore()
          .collection('users')
          .doc(user.uid)
          .set(userProfile);

        // Create approval request using unified helper
        const approvalRequest = createApprovalRequest(cleanSlateUser, {
          department,
          userType,
          employeeId,
          requestType,
          approvalLevel: approvalLevel || (userType === 'existing' ? 'branch_manager' : 'province_manager')
        });

        await app.firestore()
          .collection('approvalRequests')
          .add(approvalRequest);

        console.log('✅ Approval request created:', {
          userId: approvalRequest.userId,
          requestType: approvalRequest.requestType,
          approvalLevel: approvalRequest.approvalLevel,
          targetProvince: approvalRequest.targetProvince,
          targetBranch: approvalRequest.targetBranch
        });

        // Send notification to approvers
        await notifyApprovers(userProfile, approvalLevel || 'province_manager');

        // Keep user signed in with pending status
        const pendingUser = {
          ...userProfile,
          isPendingApproval: true,
          requiresApproval: true,
          registrationComplete: true
        };
        
        console.log('✅ Clean Slate user structure before dispatch:', cleanSlateUser);
        dispatch(receiveLogin(cleanSlateUser, 'signUpUserWithRBAC'));
        
        // Dispatch pending registration action
        const pendingAction = {
          type: 'REGISTRATION_PENDING',
          userData: pendingUser
        };
        
        dispatch(pendingAction);
        
        // Emit custom event for UI handling
        window.dispatchEvent(new CustomEvent('registrationPending', {
          detail: pendingAction
        }));
        
        console.log('✅ Clean Slate registration completed successfully:', {
          uid: pendingUser.uid,
          email: pendingUser.email,
          isPendingApproval: pendingUser.isPendingApproval
        });
        
        return pendingAction;
        
      } catch (error) {
        console.error('❌ Clean Slate signup error:', error);
        throw error;
      }
    })
    .catch(error => {
      console.error('❌ Enhanced signup error:', error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(signUpError(errorInfo.message));
      throw error;
    });
};

/**
 * Helper function to notify approvers
 */
const notifyApprovers = async (userProfile, approvalLevel) => {
  try {
    const notification = {
      type: 'user_registration_pending',
      title: 'มีการสมัครสมาชิกใหม่รอการอนุมัติ',
      message: `${userProfile.displayName} (${userProfile.email}) ได้สมัครเข้าใช้งานระบบ`,
      data: {
        userId: userProfile.uid,
        userType: userProfile.userType,
        department: userProfile.access?.departments?.[0] || 'general',
        province: userProfile.access?.geographic?.homeProvince || 'unknown',
        branch: userProfile.access?.geographic?.homeBranch || 'unknown',
        approvalLevel
      },
      targetAudience: approvalLevel === 'branch_manager' ? 'branch_managers' : 'province_managers',
      createdAt: Date.now(),
      status: 'active'
    };

    await app.firestore()
      .collection('notifications')
      .add(notification);

    console.log('📨 Notification sent to approvers');
  } catch (error) {
    console.warn('Failed to send notification to approvers:', error);
  }
};

/**
 * LOGIN USER - Clean Slate Only
 * Simplified logic with automatic migration for legacy users
 */
export const loginUser = (email, password, rememberMe = false) => dispatch => {
  dispatch(requestLogin());
  
  app.auth()
    .signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      let mUser = getFirebaseUserFromObject(userCredential);
      mUser = { ...mUser, password, lastLogin: Date.now() };

      try {
        // Load user data from Firestore
        const userDoc = await app.firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          
          // Validate user status
          const statusValidation = validateUserStatus(userData);
          
          // Handle pending approval users
          if (statusValidation.isPending) {
            const pendingUserData = {
              ...mUser,
              // Essential identity
              uid: user.uid,
              email: userData.email || user.email,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`,
              
              // Pending approval metadata
              isPendingApproval: true,
              approvalStatus: 'pending',
              isApproved: false,
              isActive: false,
              
              // Clean Slate structure for context (if available)
              access: userData.access || null,
              userType: userData.userType || 'new'
            };
            
            dispatch(receiveLogin(pendingUserData));
            return;
          }

          // Handle rejected/suspended users
          if (statusValidation.isRejected) {
            const rejectionReason = userData.rejectionReason || 'ไม่ระบุเหตุผล';
            throw new Error(`บัญชีของคุณถูกปฏิเสธ\nเหตุผล: ${rejectionReason}\nกรุณาติดต่อผู้ดูแลระบบ`);
          }

          if (statusValidation.isSuspended) {
            const suspensionReason = userData.suspensionReason || 'ไม่ระบุเหตุผล';
            let suspensionMessage = `บัญชีของคุณถูกระงับชั่วคราว\nเหตุผล: ${suspensionReason}`;
            
            if (userData.suspendedUntil) {
              const suspensionDate = new Date(userData.suspendedUntil).toLocaleDateString('th-TH');
              suspensionMessage += `\nระงับจนถึง: ${suspensionDate}`;
            }
            
            throw new Error(suspensionMessage);
          }

          // Check if user has Clean Slate structure
          if (!isValidCleanSlateUser(userData)) {
            console.log('🔄 Migrating legacy user to Clean Slate:', user.uid);
            
            // Auto-migrate to Clean Slate
            const { migrateToOrthogonalSystem } = await import('../../utils/orthogonal-rbac');
            const cleanSlateUser = migrateToOrthogonalSystem(userData);
            
            if (!cleanSlateUser?.access) {
              throw new Error('Auto-migration to Clean Slate failed');
            }

            // Update user in database with Clean Slate structure ONLY
            const updatedUserData = {
              uid: user.uid,
              email: userData.email || user.email,
              displayName: userData.displayName || user.displayName,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              access: cleanSlateUser.access,
              isActive: userData.isActive !== false,
              isApproved: userData.isApproved !== false,
              approvalStatus: userData.approvalStatus || 'approved',
              isDev: userData.isDev || false,
              created: userData.created || Date.now(),
              updatedAt: Date.now(),
              migratedAt: Date.now(),
            };

            await app.firestore()
              .collection('users')
              .doc(user.uid)
              .set(updatedUserData, { merge: false });
            
            userData = updatedUserData;
            console.log('✅ User migrated to Clean Slate successfully');
          }
          
          // Create final user object with Clean Slate structure
          mUser = {
            ...mUser,
            // Essential user data
            uid: user.uid,
            email: userData.email || user.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || user.displayName,
            
            // Clean Slate RBAC structure ONLY
            access: userData.access,
            
            // Status
            isActive: userData.isActive !== false,
            isApproved: userData.isApproved !== false,
            approvalStatus: userData.approvalStatus || 'approved',
            isDev: userData.isDev || false,
            

          };

          console.log('✅ Clean Slate user login successful:', {
            uid: mUser.uid,
            authority: mUser.access?.authority,
            geographic: mUser.access?.geographic?.scope
          });

          // Update last login time
          await app.firestore()
            .collection('users')
            .doc(user.uid)
            .update({
              lastLogin: Date.now(),
              updatedAt: Date.now()
            });
        }
      } catch (firestoreError) {
        console.error('Error loading user data:', firestoreError);
        // If it's a user status error, throw it
        if (firestoreError.message.includes('บัญชี') || firestoreError.message.includes('ระงับ')) {
          throw firestoreError;
        }
        // Otherwise, continue with basic auth
      }

      // Load provinces data
      await loadProvincesData(dispatch);

      dispatch(receiveLogin(mUser, 'loginUser'));
    })
    .catch(error => {
      console.error('Login error:', error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(loginError(errorInfo.message));
    });
};

/**
 * Helper function to load provinces data
 */
const loadProvincesData = async (dispatch) => {
  try {
    console.log('🌏 Loading provinces data...');
    const provinces = await getProvinces();
    
    if (provinces && Object.keys(provinces).length > 0) {
      dispatch(setProvinces(provinces));
      console.log('✅ Provinces loaded:', Object.keys(provinces).length, 'provinces');
    } else {
      // Default provinces for development
      const defaultProvinces = {
        'นครราชสีมา': {
          id: 'นครราชสีมา',
          provinceName: 'นครราชสีมา',
          provinceNameEn: 'Nakhon Ratchasima',
          isActive: true,
          isDefault: true
        },
        'นครสวรรค์': {
          id: 'นครสวรรค์',
          provinceName: 'นครสวรรค์',
          provinceNameEn: 'Nakhon Sawan',
          isActive: true,
          isDefault: false
        }
      };
      dispatch(setProvinces(defaultProvinces));
    }
  } catch (error) {
    console.warn('Error loading provinces:', error);
    // Set minimal default as fallback
    const minimalProvinces = {
      'นครราชสีมา': {
        id: 'นครราชสีมา',
        provinceName: 'นครราชสีมา',
        provinceNameEn: 'Nakhon Ratchasima',
        isActive: true,
        isDefault: true
      }
    };
    dispatch(setProvinces(minimalProvinces));
  }
};

/**
 * LOGOUT USER
 */
export const logoutUser = () => dispatch => {
  // Clean up approval listener if exists
  if (window.approvalListener) {
    console.log('🧹 Cleaning up approval listener');
    window.approvalListener();
    window.approvalListener = null;
  }

  dispatch(requestLogout());
  app.auth()
    .signOut()
    .then(() => dispatch(receiveLogout()))
    .catch(error => {
      console.warn(error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(logoutError(errorInfo.message));
    });
};

/**
 * FORGOT PASSWORD
 */
export const forgetPassword = email => dispatch => {
  dispatch(requestResetPassword());
  app.auth()
    .sendPasswordResetEmail(email)
    .then(() => {
      dispatch(receiveResetPassword());
    })
    .catch(error => {
      console.warn(error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(resetPasswordError(errorInfo.message));
    });
};

/**
 * VERIFY AUTH - Clean Slate Only
 * Simplified auth verification with automatic migration
 */
export const verifyAuth = () => dispatch => {
  dispatch(verifyRequest());
  
  app.auth().onAuthStateChanged(async (user) => {
    if (user !== null) {
      try {
        let mUser = getFirebaseUserFromObject(user);
        mUser = { ...mUser, lastLogin: Date.now() };

        // Load user data from Firestore
        const userDoc = await app.firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          
          // Validate user status
          const statusValidation = validateUserStatus(userData);
          
          // Handle pending approval users - keep them signed in
          if (statusValidation.isPending) {
            console.log('⏳ Pending approval user during verification:', user.uid);
            
            mUser = {
              ...mUser,
              // Essential identity
              uid: user.uid,
              email: userData.email || user.email,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              displayName: userData.displayName || user.displayName,
              
              // Pending status
              isPendingApproval: true,
              approvalStatus: 'pending',
              isApproved: false,
              isActive: false,
              
              // Clean Slate structure if available
              access: userData.access || null,
              userType: userData.userType || 'new'
            };
            
            // Set up approval listener
            setupApprovalListener(user.uid, dispatch);
            
            dispatch(receiveLogin(mUser, 'verifyAuth'));
            dispatch(verifySuccess());
            return;
          }

          // Handle rejected/suspended users - sign them out
          if (statusValidation.isRejected || statusValidation.isSuspended) {
            console.warn('❌ User rejected/suspended during verification, signing out:', user.uid);
            app.auth().signOut();
            return;
          }

          // Check if user has Clean Slate structure
          if (!isValidCleanSlateUser(userData)) {
            console.log('🔄 Auto-migrating legacy user during verification:', user.uid);
            
            const { migrateToOrthogonalSystem } = await import('../../utils/orthogonal-rbac');
            const cleanSlateUser = migrateToOrthogonalSystem(userData);
            
            if (cleanSlateUser?.access) {
              // Update user in database with Clean Slate structure
              const updatedUserData = {
                uid: user.uid,
                email: userData.email || user.email,
                displayName: userData.displayName || user.displayName,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                access: cleanSlateUser.access,
                isActive: userData.isActive !== false,
                isApproved: userData.isApproved !== false,
                approvalStatus: userData.approvalStatus || 'approved',
                isDev: userData.isDev || false,
                created: userData.created || Date.now(),
                updatedAt: Date.now(),
                migratedAt: Date.now(),
              };

              await app.firestore()
                .collection('users')
                .doc(user.uid)
                .set(updatedUserData, { merge: false });
              
              userData = updatedUserData;
              console.log('✅ User auto-migrated during verification');
            } else {
              console.error('❌ Auto-migration failed during verification');
              app.auth().signOut();
              return;
            }
          }
          
          // Create final user object with Clean Slate structure
          mUser = {
            ...mUser,
            // Clean Slate RBAC structure
            access: userData.access,
            
            // Core profile fields
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || user.displayName,
            email: userData.email || user.email,
            
            // Status fields
            isDev: userData.isDev || false,
            isApproved: userData.isApproved !== false,
            isActive: userData.isActive !== false,
            approvalStatus: userData.approvalStatus || 'approved',
            isPendingApproval: false,
            
            // Metadata
            created: userData.created,
            updatedAt: userData.updatedAt || Date.now()
          };
          
          console.log('✅ Clean Slate user verified successfully:', user.uid);
        }

        // Load provinces data
        await loadProvincesData(dispatch);

        dispatch(receiveLogin(mUser, 'verifyAuth'));
      } catch (error) {
        console.error('Error verifying user auth:', error);
        app.auth().signOut();
      }
    } else {
      // User signed out
      console.log('🔄 User signed out, clearing authentication state');
      dispatch(receiveLogout());
    }
    
    dispatch(verifySuccess());
  });
};

/**
 * Helper function to set up real-time approval status listener
 */
const setupApprovalListener = (userId, dispatch) => {
  console.log('🔔 Setting up approval status listener for user:', userId);
  
  // Clean up existing listener
  if (window.approvalListener && typeof window.approvalListener === 'function') {
    window.approvalListener();
    window.approvalListener = null;
  }
  
  const userRef = app.firestore().collection('users').doc(userId);
  
  const unsubscribe = userRef.onSnapshot(
    (doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const statusValidation = validateUserStatus(userData);
        
        console.log('🔄 Approval status update:', userId, statusValidation);
        
        // If user gets approved, reload profile and redirect
        if (!statusValidation.isPending && statusValidation.isApproved && statusValidation.isActive) {
          console.log('✅ User approved! Reloading profile...');
          
          unsubscribe();
          window.approvalListener = null;
          
          dispatch(verifyAuth());
          
          window.dispatchEvent(new CustomEvent('userApproved', {
            detail: { userId, userData }
          }));
        }
        
        // If user gets rejected, sign them out
        if (statusValidation.isRejected || statusValidation.isSuspended) {
          console.log('❌ User rejected/suspended, signing out...');
          
          unsubscribe();
          window.approvalListener = null;
          
          app.auth().signOut();
        }
      }
    },
    (error) => {
      console.error('Error in approval status listener:', error);
      if (unsubscribe) {
        unsubscribe();
        window.approvalListener = null;
      }
    }
  );
  
  window.approvalListener = unsubscribe;
};

/**
 * UPDATE USER
 */
export const updateUser = user => ({
  type: USER_UPDATE,
  user
});
