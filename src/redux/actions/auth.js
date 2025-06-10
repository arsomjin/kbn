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
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(signUpError(errorInfo.message));
    });
};

// Enhanced signup with RBAC integration
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
    accessLevel,
    allowedProvinces,
    allowedBranches,
    userType,
    requestType,
    employeeId,
    registrationSource,
    needsManagerApproval,
    approvalLevel
  } = userData;

  return app
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      
      // Determine permissions based on access level and department
      const defaultPermissions = determineDefaultPermissions(accessLevel, department);
      
      // Create user profile with enhanced RBAC data
      const userProfile = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        created: Date.now(),
        lastLogin: Date.now(),
        // RBAC Fields
        accessLevel,
        department,
        homeProvince: province,
        homeBranch: branch,
        allowedProvinces: allowedProvinces || [province],
        allowedBranches: allowedBranches || [branch],
        // User type and registration metadata
        userType,
        employeeId: employeeId || null,
        registrationSource: registrationSource || 'web',
        // Status fields
        isActive: false, // Requires approval
        isApproved: false,
        requestType: requestType || 'new_employee_registration',
        approvalStatus: 'pending',
        approvedBy: null,
        approvedAt: null,
        needsManagerApproval: needsManagerApproval !== false,
        approvalLevel: approvalLevel || (userType === 'existing' ? 'branch_manager' : 'province_manager'),
        // Geographic metadata
        geographic: {
          homeProvince: province,
          homeBranch: branch,
          allowedProvinces: allowedProvinces || [province],
          allowedBranches: allowedBranches || [branch]
        },
        // Registration metadata
        registrationMetadata: {
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          platform: 'web',
          version: '2.0'
        }
      };

      // Update Firebase Auth profile
      await user.updateProfile({
        displayName: userProfile.displayName
      });

      // Save to Firestore with enhanced structure
      await app.firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          auth: userProfile,
          rbac: {
            accessLevel,
            permissions: defaultPermissions,
            geographic: {
              homeProvince: province,
              homeBranch: branch,
              allowedProvinces: allowedProvinces || [province],
              allowedBranches: allowedBranches || [branch]
            },
            lastUpdated: Date.now(),
            updatedBy: 'system'
          },
          profile: {
            firstName,
            lastName,
            email,
            department,
            userType,
            employeeId: employeeId || null,
            created: Date.now(),
            lastProfileUpdate: Date.now()
          },
          status: {
            isActive: false,
            isApproved: false,
            approvalStatus: 'pending',
            registrationComplete: true,
            lastStatusUpdate: Date.now()
          }
        });

      // Create detailed approval request
      await app.firestore()
        .collection('approvalRequests')
        .add({
          userId: user.uid,
          requestType: requestType || 'new_employee_registration',
          userData: userProfile,
          status: 'pending',
          priority: userType === 'existing' ? 'high' : 'normal',
          createdAt: Date.now(),
          targetProvince: province,
          targetBranch: branch,
          department,
          accessLevel,
          userType,
          employeeId: employeeId || null,
          approvalLevel: approvalLevel || (userType === 'existing' ? 'branch_manager' : 'province_manager'),
          metadata: {
            registrationSource: registrationSource || 'web',
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          },
          // Additional context for approvers
          context: {
            isExistingEmployee: userType === 'existing',
            hasEmployeeId: !!employeeId,
            requestedPermissions: defaultPermissions,
            geographicScope: {
              province,
              branch,
              allowedProvinces: allowedProvinces || [province],
              allowedBranches: allowedBranches || [branch]
            }
          }
        });

      // Send notification to appropriate approvers
      await notifyApprovers(userProfile, approvalLevel || (userType === 'existing' ? 'branch_manager' : 'province_manager'));

      // For demo, we'll auto-approve in development for existing users with employee ID
      if (process.env.NODE_ENV === 'development' && userType === 'existing' && employeeId) {
        console.log('🔧 Development mode: Auto-approving existing employee with ID');
        userProfile.isActive = true;
        userProfile.isApproved = true;
        userProfile.approvalStatus = 'approved';
        userProfile.approvedBy = 'system-dev';
        userProfile.approvedAt = Date.now();
        
        await app.firestore()
          .collection('users')
          .doc(user.uid)
          .update({
            'auth.isActive': true,
            'auth.isApproved': true,
            'auth.approvalStatus': 'approved',
            'auth.approvedBy': 'system-dev',
            'auth.approvedAt': Date.now(),
            'status.isActive': true,
            'status.isApproved': true,
            'status.approvalStatus': 'approved',
            'status.lastStatusUpdate': Date.now()
          });
      }

      // Handle both approved and pending users properly
      if (userProfile.isApproved) {
        console.log('✅ User approved, completing signup:', user.uid);
        dispatch(receiveSignUp(userProfile));
        return { type: 'SIGNUP_SUCCESS', user: userProfile };
      } else {
        console.log('⏳ User registered but requires approval, keeping signed in for pending status:', user.uid);
        
        // Keep user signed in but mark as pending approval
        // This prevents the race condition and provides better UX
        const pendingUser = {
          ...userProfile,
          isPendingApproval: true,
          requiresApproval: true,
          registrationComplete: true
        };
        
        // Dispatch login success with pending status so verifyAuth handles it properly
        dispatch(receiveLogin(pendingUser));
        
        // Dispatch a special registration pending action for UI handling
        const pendingAction = {
          type: 'REGISTRATION_PENDING',
          userData: pendingUser
        };
        
        dispatch(pendingAction);
        
        // Also emit a custom event for the Auth component to catch
        window.dispatchEvent(new CustomEvent('registrationPending', {
          detail: pendingAction
        }));
        
        return pendingAction;
      }
    })
    .catch(error => {
      console.error('Enhanced signup error:', error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(signUpError(errorInfo.message));
      throw error; // Re-throw so the calling component can handle it
    });
};

// Helper function to determine default permissions based on access level and department
const determineDefaultPermissions = (accessLevel, department) => {
  const permissions = {};
  
  // Base permissions by department
  switch (department) {
    case 'accounting':
      permissions['accounting.view'] = true;
      permissions['accounting.edit'] = accessLevel !== 'STAFF';
      break;
    case 'sales':
      permissions['sales.view'] = true;
      permissions['sales.edit'] = true;
      break;
    case 'service':
      permissions['service.view'] = true;
      permissions['service.edit'] = true;
      break;
    case 'inventory':
      permissions['inventory.view'] = true;
      permissions['inventory.edit'] = accessLevel !== 'STAFF';
      break;
    case 'management':
      permissions['*'] = true; // Full access for management
      break;
    default:
      permissions['reports.view'] = true;
  }
  
  // Additional permissions by access level
  if (accessLevel === 'BRANCH_MANAGER') {
    permissions['reports.view'] = true;
    permissions['users.view'] = true;
  }
  
  if (accessLevel === 'PROVINCE_MANAGER') {
    permissions['*'] = true; // Full access
  }
  
  return permissions;
};

// Helper function to notify appropriate approvers
const notifyApprovers = async (userProfile, approvalLevel) => {
  try {
    // Create notification for approvers
    const notification = {
      type: 'user_registration_pending',
      title: 'มีการสมัครสมาชิกใหม่รอการอนุมัติ',
      message: `${userProfile.displayName} (${userProfile.email}) ได้สมัครเข้าใช้งานระบบ`,
      data: {
        userId: userProfile.uid,
        userType: userProfile.userType,
        department: userProfile.department,
        province: userProfile.homeProvince,
        branch: userProfile.homeBranch,
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

// Helper function to set up real-time approval status listener
const setupApprovalListener = (userId, dispatch) => {
  console.log('🔔 Setting up approval status listener for user:', userId);
  
  // Clean up any existing listener first
  if (window.approvalListener && typeof window.approvalListener === 'function') {
    console.log('🧹 Cleaning up existing approval listener');
    window.approvalListener();
    window.approvalListener = null;
  }
  
  const userRef = app.firestore().collection('users').doc(userId);
  
  // Set up real-time listener
  const unsubscribe = userRef.onSnapshot(
    (doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const authStatus = userData.auth || {};
        const statusData = userData.status || {};
        const isApproved = authStatus.isApproved ?? statusData.isApproved ?? false;
        const isActive = authStatus.isActive ?? statusData.isActive ?? false;
        const approvalStatus = authStatus.approvalStatus || statusData.approvalStatus || 'pending';
        
        console.log('🔄 Approval status update for user:', userId, {
          isApproved,
          isActive,
          approvalStatus
        });
        
        // If user gets approved, reload their full profile and redirect
        if (isApproved && isActive && approvalStatus === 'approved') {
          console.log('✅ User approved! Reloading full profile and redirecting...');
          
          // Clean up listener
          unsubscribe();
          window.approvalListener = null;
          
          // Trigger a full auth verification to reload complete user data
          dispatch(verifyAuth());
          
          // Emit approval event for UI components to handle
          window.dispatchEvent(new CustomEvent('userApproved', {
            detail: { userId, userData }
          }));
        }
        
        // If user gets rejected or suspended, sign them out
        if (!isActive && (approvalStatus === 'rejected' || approvalStatus === 'suspended')) {
          console.log('❌ User rejected/suspended, signing out...');
          
          // Clean up listener
          unsubscribe();
          window.approvalListener = null;
          
          // Sign out the user
          app.auth().signOut();
        }
      }
    },
    (error) => {
      console.error('Error in approval status listener:', error);
      // Clean up listener on error to prevent repeated errors
      if (unsubscribe) {
        unsubscribe();
        window.approvalListener = null;
      }
    }
  );
  
  // Store unsubscribe function globally so it can be cleaned up on logout
  window.approvalListener = unsubscribe;
};

export const loginUser = (email, password, rememberMe = false) => dispatch => {
  dispatch(requestLogin());
  app
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      let mUser = getFirebaseUserFromObject(userCredential);
      mUser = { ...mUser, password, lastLogin: Date.now() };

      try {
        // Load user RBAC data from Firestore
        const userDoc = await app.firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          
          // Enhanced status checking with better error messages
          const authStatus = userData.auth || {};
          const statusData = userData.status || {};
          const isApproved = authStatus.isApproved ?? statusData.isApproved ?? false;
          const isActive = authStatus.isActive ?? statusData.isActive ?? false;
          const approvalStatus = authStatus.approvalStatus || statusData.approvalStatus || 'pending';
          
          // Check approval status - Don't throw error, instead set pending state
          if (!isApproved || approvalStatus === 'pending') {
            const userType = authStatus.userType || 'new';
            const department = authStatus.department || 'ไม่ระบุ';
            const branch = authStatus.homeBranch || 'ไม่ระบุ';
            
            // Create pending user object instead of throwing error
            mUser = {
              ...mUser,
              ...userData.auth,
              // Mark as pending approval
              isPendingApproval: true,
              approvalStatus: 'pending',
              isApproved: false,
              isActive: false,
              // Include metadata for pending page
              userType,
              department,
              homeProvince: authStatus.homeProvince || 'ไม่ระบุ',
              homeBranch: branch,
              approvalLevel: authStatus.approvalLevel || (userType === 'existing' ? 'branch_manager' : 'province_manager'),
              // Basic identity info
              firstName: authStatus.firstName,
              lastName: authStatus.lastName,
              email: authStatus.email,
              displayName: authStatus.displayName || `${authStatus.firstName || ''} ${authStatus.lastName || ''}`,
              uid: user.uid
            };
            
            // Don't set up approval listener here - it will be set up in verifyAuth
            // when the user stays signed in
            
            // Dispatch login success with pending status
            dispatch(receiveLogin(mUser));
            return; // Exit early for pending users
          }

          if (!isActive || approvalStatus === 'rejected') {
            const rejectionReason = authStatus.rejectionReason || statusData.rejectionReason || 'ไม่ระบุเหตุผล';
            throw new Error(
              `บัญชีของคุณถูกระงับการใช้งาน\n` +
              `เหตุผล: ${rejectionReason}\n` +
              `กรุณาติดต่อผู้ดูแลระบบ`
            );
          }

          if (approvalStatus === 'suspended') {
            const suspensionReason = authStatus.suspensionReason || statusData.suspensionReason || 'ไม่ระบุเหตุผล';
            const suspendedUntil = authStatus.suspendedUntil || statusData.suspendedUntil;
            let suspensionMessage = `บัญชีของคุณถูกระงับชั่วคราว\nเหตุผล: ${suspensionReason}`;
            
            if (suspendedUntil) {
              const suspensionDate = new Date(suspendedUntil).toLocaleDateString('th-TH');
              suspensionMessage += `\nระงับจนถึง: ${suspensionDate}`;
            }
            
            throw new Error(suspensionMessage);
          }

          // Enhanced RBAC data merging with legacy support
          const rbacData = userData.rbac || {};
          const legacyAccessLevel = rbacData.accessLevel || authStatus.accessLevel || 'STAFF';
          const legacyHomeProvince = rbacData.geographic?.homeProvince || authStatus.homeProvince || 'นครราชสีมา';
          const legacyHomeBranch = rbacData.geographic?.homeBranch || authStatus.homeBranch || '0450';
          
          mUser = {
            ...mUser,
            ...userData.auth,
            // RBAC fields with legacy fallbacks
            accessLevel: legacyAccessLevel,
            permissions: userData.rbac?.permissions || {},
            allowedProvinces: userData.rbac?.geographic?.allowedProvinces || userData.auth?.allowedProvinces || [legacyHomeProvince],
            allowedBranches: userData.rbac?.geographic?.allowedBranches || userData.auth?.allowedBranches || [legacyHomeBranch],
            homeProvince: legacyHomeProvince,
            homeBranch: legacyHomeBranch,
            department: userData.auth?.department || 'general',
            // Profile fields
            firstName: userData.auth?.firstName || userData.profile?.firstName,
            lastName: userData.auth?.lastName || userData.profile?.lastName,
            displayName: userData.auth?.displayName || `${userData.profile?.firstName || 'User'} ${userData.profile?.lastName || ''}`,
            // Developer flag - check both root level and auth nested object
            isDev: userData.isDev || userData.auth?.isDev || false,
            // Status with legacy defaults
            isApproved: userData.auth?.isApproved !== false, // Default to true for legacy users
            isActive: userData.auth?.isActive !== false, // Default to true for legacy users
            approvalStatus: userData.auth?.approvalStatus || 'approved'
          };

          // Auto-migrate legacy users to have proper RBAC structure
          if (!userData.rbac || !userData.rbac.accessLevel) {
            console.log('🔄 Auto-migrating legacy user to RBAC structure:', user.uid);
            await app.firestore()
              .collection('users')
              .doc(user.uid)
              .update({
                'rbac.accessLevel': legacyAccessLevel,
                'rbac.permissions': {},
                'rbac.geographic.homeProvince': legacyHomeProvince,
                'rbac.geographic.homeBranch': legacyHomeBranch,
                'rbac.geographic.allowedProvinces': [legacyHomeProvince],
                'rbac.geographic.allowedBranches': [legacyHomeBranch],
                'auth.isApproved': true,
                'auth.isActive': true,
                'auth.approvalStatus': 'approved',
                'auth.department': userData.auth?.department || 'general'
              });
          }

          // Update last login time
          await app.firestore()
            .collection('users')
            .doc(user.uid)
            .update({
              'auth.lastLogin': Date.now(),
              'auth.lastLoginIP': window.location.hostname // Simple IP tracking
            });
        }
      } catch (firestoreError) {
        console.warn('Error loading user RBAC data:', firestoreError);
        // If it's an approval/activation error, throw it
        if (firestoreError.message.includes('อนุมัติ') || firestoreError.message.includes('ระงับ')) {
          throw firestoreError;
        }
        // Otherwise, continue with basic auth
      }

      // Load provinces data for geographic context
      try {
        console.log('🌏 Loading provinces data for geographic context...');
        const provinces = await getProvinces();
        if (provinces && Object.keys(provinces).length > 0) {
          dispatch(setProvinces(provinces));
          console.log('✅ Provinces loaded successfully:', Object.keys(provinces).length, 'provinces');
        } else {
          // Fallback to default provinces for development/legacy support
          console.log('🔄 No provinces found, using default fallback data');
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
      } catch (provincesError) {
        console.warn('Error loading provinces data:', provincesError);
        // Set minimal default provinces as fallback
        const defaultProvinces = {
          'นครราชสีมา': {
            id: 'นครราชสีมา',
            provinceName: 'นครราชสีมา',
            provinceNameEn: 'Nakhon Ratchasima',
            isActive: true,
            isDefault: true
          }
        };
        dispatch(setProvinces(defaultProvinces));
        console.log('🔄 Set minimal default provinces due to loading error');
      }

      dispatch(receiveLogin(mUser));
    })
    .catch(error => {
      console.warn('Login error:', error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(loginError(errorInfo.message));
    });
};

export const logoutUser = () => dispatch => {
  // Clean up approval listener if exists
  if (window.approvalListener) {
    console.log('🧹 Cleaning up approval listener');
    window.approvalListener();
    window.approvalListener = null;
  }

  dispatch(requestLogout());
  app
    .auth()
    .signOut()
    .then(() => dispatch(receiveLogout()))
    .catch(error => {
      //Do something with the error if you want!
      console.warn(error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(logoutError(errorInfo.message));
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
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(resetPasswordError(errorInfo.message));
    });
};

export const verifyAuth = () => dispatch => {
  dispatch(verifyRequest());
  app.auth().onAuthStateChanged(async (user) => {
    if (user !== null) {
      // User is signed in - load their full profile
      try {
      let mUser = getFirebaseUserFromObject(user);
        mUser = { ...mUser, lastLogin: Date.now() };

        // Load user RBAC data from Firestore for verification
        const userDoc = await app.firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          
          // Enhanced status checking for pending users - Don't sign them out
          const authStatus = userData.auth || {};
          const statusData = userData.status || {};
          const isApproved = authStatus.isApproved ?? statusData.isApproved ?? false;
          const isActive = authStatus.isActive ?? statusData.isActive ?? false;
          const approvalStatus = authStatus.approvalStatus || statusData.approvalStatus || 'pending';
          
          // Handle pending approval users - keep them signed in but mark as pending
          if (!isApproved || approvalStatus === 'pending') {
            console.log('User account pending approval, keeping signed in with pending status:', user.uid);
            
            const userType = authStatus.userType || 'new';
            const department = authStatus.department || 'ไม่ระบุ';
            const branch = authStatus.homeBranch || 'ไม่ระบุ';
            
            mUser = {
              ...mUser,
              ...userData.auth,
              // Mark as pending approval
              isPendingApproval: true,
              approvalStatus: 'pending',
              isApproved: false,
              isActive: false,
              // Include metadata for pending page
              userType,
              department,
              homeProvince: authStatus.homeProvince || 'ไม่ระบุ',
              homeBranch: branch,
              approvalLevel: authStatus.approvalLevel || (userType === 'existing' ? 'branch_manager' : 'province_manager'),
              // Basic identity info
              firstName: authStatus.firstName,
              lastName: authStatus.lastName,
              email: authStatus.email,
              displayName: authStatus.displayName || `${authStatus.firstName || ''} ${authStatus.lastName || ''}`,
              uid: user.uid
            };
            
            // Set up approval status listener for this user
            setupApprovalListener(user.uid, dispatch);
            
            dispatch(receiveLogin(mUser));
            dispatch(verifySuccess());
            return;
          }

          // Check if user is rejected or suspended - these should be signed out
          if (!isActive && (approvalStatus === 'rejected' || approvalStatus === 'suspended')) {
            console.warn('User account rejected/suspended, signing out:', user.uid);
            app.auth().signOut();
            return;
          }

          // Merge RBAC data for verified users
          const legacyAccessLevel = userData.rbac?.accessLevel || userData.auth?.accessLevel || 'STAFF';
          const legacyHomeProvince = userData.rbac?.geographic?.homeProvince || userData.auth?.homeProvince || 'นครราชสีมา';
          const legacyHomeBranch = userData.rbac?.geographic?.homeBranch || userData.auth?.homeBranch || '0450';
          
          mUser = {
            ...mUser,
            ...userData.auth,
            // RBAC fields with legacy fallbacks
            accessLevel: legacyAccessLevel,
            permissions: userData.rbac?.permissions || {},
            allowedProvinces: userData.rbac?.geographic?.allowedProvinces || userData.auth?.allowedProvinces || [legacyHomeProvince],
            allowedBranches: userData.rbac?.geographic?.allowedBranches || userData.auth?.allowedBranches || [legacyHomeBranch],
            homeProvince: legacyHomeProvince,
            homeBranch: legacyHomeBranch,
            department: userData.auth?.department || 'general',
            // Profile fields
            firstName: userData.auth?.firstName || userData.profile?.firstName,
            lastName: userData.auth?.lastName || userData.profile?.lastName,
            displayName: userData.auth?.displayName || `${userData.profile?.firstName || 'User'} ${userData.profile?.lastName || ''}`,
            // Developer flag - check both root level and auth nested object
            isDev: userData.isDev || userData.auth?.isDev || false,
            // Status with legacy defaults
            isApproved: userData.auth?.isApproved !== false,
            isActive: userData.auth?.isActive !== false,
            approvalStatus: userData.auth?.approvalStatus || 'approved'
          };
        }

        // Load provinces data for geographic context
        try {
          console.log('🌏 Loading provinces data during auth verification...');
          const provinces = await getProvinces();
          if (provinces && Object.keys(provinces).length > 0) {
            dispatch(setProvinces(provinces));
            console.log('✅ Provinces loaded successfully during verification:', Object.keys(provinces).length, 'provinces');
          } else {
            // Fallback to default provinces for development/legacy support
            console.log('🔄 No provinces found during verification, using default fallback data');
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
        } catch (provincesError) {
          console.warn('Error loading provinces data during verification:', provincesError);
          // Set minimal default provinces as fallback
          const defaultProvinces = {
            'นครราชสีมา': {
              id: 'นครราชสีมา',
              provinceName: 'นครราชสีมา',
              provinceNameEn: 'Nakhon Ratchasima',
              isActive: true,
              isDefault: true
            }
          };
          dispatch(setProvinces(defaultProvinces));
          console.log('🔄 Set minimal default provinces during verification due to loading error');
        }

      dispatch(receiveLogin(mUser));
      } catch (error) {
        console.warn('Error verifying user auth:', error);
        // Sign out on verification error
        app.auth().signOut();
      }
    } else {
      // User is signed out - ensure Redux state reflects this
      console.log('🔄 User signed out, clearing authentication state');
      dispatch(receiveLogout());
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
