import { getProvinces } from 'firebase/api';
import { getFirebaseUserFromObject } from 'Modules/Auth/api';
import { app } from '../../firebase';
import FirebaseErrorHandler from '../../utils/firebaseErrorHandler';
import { setProvinces } from './provinces';

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
  // Check if user has access structure
  if (!user?.access) return false;

  // Check authority
  if (!user.access.authority) return false;

  // Check geographic - can be string (legacy) or object with scope (new format)
  const hasValidGeographic = !!(
    user.access.geographic &&
    (typeof user.access.geographic === 'string' ||
      (typeof user.access.geographic === 'object' &&
        user.access.geographic.scope))
  );

  if (!hasValidGeographic) return false;

  // Check departments
  if (!Array.isArray(user.access.departments)) return false;

  return true;
};

/**
 * Helper function to handle user status validation
 * @param {Object} userData - User data from Firestore
 * @returns {Object} - Status validation result
 */
const validateUserStatus = (userData) => {
  // FIXED: Proper validation for new users - undefined should be treated as pending
  const isApproved = userData.isApproved === true;
  const isActive = userData.isActive === true;
  const approvalStatus = userData.approvalStatus || 'pending'; // Default to pending for new users

  // FIXED: Rejected/suspended users should NOT be treated as pending
  const isRejected = !isActive && approvalStatus === 'rejected';
  const isSuspended = !isActive && approvalStatus === 'suspended';
  const isResignedPending = approvalStatus === 'resigned_pending'; // New status for resigned employees
  const isPending =
    !isApproved &&
    !isRejected &&
    !isSuspended &&
    (approvalStatus === 'pending' || isResignedPending);

  return {
    isApproved,
    isActive,
    approvalStatus,
    isPending,
    isRejected,
    isSuspended,
    isResignedPending, // Add resigned pending status
  };
};

/**
 * SIGNUP SUCCESS - Clean Slate Only
 * For Clean Slate users, no Firestore update needed as it's done in signUpUserWithRBAC
 */
const receiveSignUp = (user) => {
  console.log('✅ Clean Slate user signup success:', user.uid);

  // Validate Clean Slate structure
  if (!isValidCleanSlateUser(user)) {
    console.error('🚨 Invalid Clean Slate user structure in signup:', user.uid);
    throw new Error('Invalid user structure - Clean Slate format required');
  }

  return {
    type: SIGNUP_SUCCESS,
    user,
  };
};

const signUpError = (error) => {
  return {
    type: SIGNUP_FAILURE,
    error,
  };
};

/**
 * LOGIN SUCCESS - Clean Slate Only
 * No legacy auth structure updates
 */
const receiveLogin = (user, from) => {
  console.log('[receiveLogin] user:', user);
  console.log('[receiveLogin] from:', from);

  // Validate user object structure
  if (!user || typeof user !== 'object') {
    console.error('🚨 receiveLogin: Invalid user object:', user);
    throw new Error('Invalid user object provided to receiveLogin');
  }

  // Ensure user has essential fields
  if (!user.uid) {
    console.error('🚨 receiveLogin: User missing UID:', user);
    throw new Error('User object missing required UID field');
  }

  // Handle pending approval users (may not have complete Clean Slate structure yet)
  if (user.isPendingApproval) {
    console.log('⏳ Pending approval user login:', user.uid);
    return {
      type: LOGIN_SUCCESS,
      user,
    };
  }

  // For Clean Slate users, validate structure
  if (isValidCleanSlateUser(user)) {
    console.log('✅ Clean Slate user login success:', user.uid);
    return {
      type: LOGIN_SUCCESS,
      user,
    };
  }

  // Enhanced error logging for debugging
  console.error('🚨 Invalid user structure in receiveLogin:', {
    uid: user.uid,
    email: user.email,
    hasAccess: !!user.access,
    hasAuthority: !!user.access?.authority,
    hasGeographic: !!user.access?.geographic,
    hasDepartments: !!user.access?.departments,
    from,
    userKeys: Object.keys(user),
  });

  throw new Error(
    `Invalid user structure - Clean Slate RBAC required. User ${user.uid} needs migration.`
  );
};

const loginError = (error) => {
  return {
    type: LOGIN_FAILURE,
    error,
  };
};

const requestSignUp = () => ({ type: SIGNUP_REQUEST });
const requestLogin = () => ({ type: LOGIN_REQUEST });
const requestResetPassword = () => ({ type: RESET_PASSWORD_REQUEST });
const receiveResetPassword = () => ({ type: RESET_PASSWORD_SUCCESS });
const resetPasswordError = (error) => ({ type: RESET_PASSWORD_FAILURE, error });
const requestLogout = () => ({ type: LOGOUT_REQUEST });
const receiveLogout = () => ({ type: LOGOUT_SUCCESS });
const logoutError = (error) => ({ type: LOGOUT_FAILURE, error });
const verifyRequest = () => ({ type: VERIFY_REQUEST });

export const verifySuccess = () => ({ type: VERIFY_SUCCESS });

/**
 * LEGACY SIGNUP - Deprecated
 * This function is kept for backward compatibility but should not be used
 * Use signUpUserWithRBAC instead
 */
export const signUpUser =
  (firstName, lastName, email, password) => (dispatch) => {
    console.warn(
      '⚠️ Legacy signUpUser called - use signUpUserWithRBAC instead'
    );
    dispatch(requestSignUp());

    app
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((user) => {
        let mUser = getFirebaseUserFromObject(user);
        mUser = {
          ...mUser,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          password,
          created: Date.now(),
          lastLogin: Date.now(),
          requiresMigration: true, // Flag for migration
        };
        dispatch(receiveSignUp(mUser));
      })
      .catch((error) => {
        console.warn(error);
        const errorInfo = FirebaseErrorHandler.interpret(error);
        dispatch(signUpError(errorInfo.message));
      });
  };

/**
 * ENHANCED SIGNUP WITH CLEAN SLATE RBAC
 * Creates users with Clean Slate structure only using unified helpers
 */
export const signUpUserWithRBAC = (userData) => (dispatch) => {
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
    employeeStatus,
    isResignedEmployee,
    registrationSource,
    needsManagerApproval,
    approvalLevel,
  } = userData;

  return app
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      try {
        // Import Clean Slate helpers
        const {
          createCleanSlateUser,
          createApprovalRequest,
          validateCleanSlateUser,
        } = await import('../../utils/clean-slate-helpers');

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
          userType,
        });

        // Validate Clean Slate structure
        const validation = validateCleanSlateUser(cleanSlateUser);
        if (!validation.isValid) {
          throw new Error(
            `Invalid Clean Slate user structure: ${validation.errors.join(', ')}`
          );
        }

        console.log('✅ Clean Slate user structure created and validated:', {
          uid: cleanSlateUser.uid,
          authority: cleanSlateUser.access?.authority,
          geographic: cleanSlateUser.access?.geographic?.scope,
          departments: cleanSlateUser.access?.departments,
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
          employeeStatus: employeeStatus || null,
          isResignedEmployee: isResignedEmployee || false,

          // Status tracking - resigned employees get special status
          isActive: cleanSlateUser.isActive,
          isApproved: cleanSlateUser.isApproved,
          approvalStatus: isResignedEmployee
            ? 'resigned_pending'
            : cleanSlateUser.approvalStatus,
          requiresSpecialApproval: isResignedEmployee,

          // System metadata
          isDev: false,
          created: Date.now(),
          updatedAt: Date.now(),
          createdAt: cleanSlateUser.createdAt,
          migrationType: cleanSlateUser.migrationType,
        };

        // Update Firebase Auth profile
        await user.updateProfile({
          displayName: userProfile.displayName,
        });

        // Save to Firestore with unified Clean Slate structure
        await app
          .firestore()
          .collection('users')
          .doc(user.uid)
          .set(userProfile);

        // Create approval request using unified helper
        const approvalRequest = createApprovalRequest(cleanSlateUser, {
          department,
          userType,
          employeeId,
          employeeStatus,
          isResignedEmployee,
          requestType,
          approvalLevel:
            approvalLevel ||
            (isResignedEmployee
              ? 'province_manager'
              : userType === 'existing'
                ? 'branch_manager'
                : 'province_manager'),
          specialApprovalRequired: isResignedEmployee,
          approvalNotes: isResignedEmployee
            ? 'พนักงานเดิม (ลาออกแล้ว) - ต้องการอนุมัติพิเศษ'
            : null,
        });

        await app
          .firestore()
          .collection('approvalRequests')
          .add(approvalRequest);

        console.log('✅ Approval request created:', {
          userId: approvalRequest.userId,
          requestType: approvalRequest.requestType,
          approvalLevel: approvalRequest.approvalLevel,
          targetProvince: approvalRequest.targetProvince,
          targetBranch: approvalRequest.targetBranch,
        });

        // Send notification to approvers
        await notifyApprovers(
          userProfile,
          approvalLevel || 'province_manager',
          isResignedEmployee
        );

        // Keep user signed in with pending status
        const pendingUser = {
          ...userProfile,
          isPendingApproval: true,
          requiresApproval: true,
          registrationComplete: true,
        };

        console.log(
          '✅ Clean Slate user structure before dispatch:',
          cleanSlateUser
        );
        dispatch(receiveLogin(cleanSlateUser, 'signUpUserWithRBAC'));

        // Dispatch pending registration action
        const pendingAction = {
          type: 'REGISTRATION_PENDING',
          userData: pendingUser,
        };

        dispatch(pendingAction);

        // Emit custom event for UI handling
        window.dispatchEvent(
          new CustomEvent('registrationPending', {
            detail: pendingAction,
          })
        );

        console.log('✅ Clean Slate registration completed successfully:', {
          uid: pendingUser.uid,
          email: pendingUser.email,
          isPendingApproval: pendingUser.isPendingApproval,
        });

        return pendingAction;
      } catch (error) {
        console.error('❌ Clean Slate signup error:', error);
        throw error;
      }
    })
    .catch((error) => {
      console.error('❌ Enhanced signup error:', error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(signUpError(errorInfo.message));
      throw error;
    });
};

/**
 * Helper function to notify approvers
 */
const notifyApprovers = async (
  userProfile,
  approvalLevel,
  isResignedEmployee = false
) => {
  try {
    const notification = {
      type: isResignedEmployee
        ? 'resigned_employee_registration_pending'
        : 'user_registration_pending',
      title: isResignedEmployee
        ? 'มีพนักงานเดิม (ลาออกแล้ว) สมัครใช้งานระบบ - ต้องการอนุมัติพิเศษ'
        : 'มีการสมัครสมาชิกใหม่รอการอนุมัติ',
      message: isResignedEmployee
        ? `${userProfile.displayName} (${userProfile.email}) เป็นพนักงานเดิมที่ลาออกแล้ว ต้องการอนุมัติพิเศษจากผู้จัดการ`
        : `${userProfile.displayName} (${userProfile.email}) ได้สมัครเข้าใช้งานระบบ`,
      data: {
        userId: userProfile.uid,
        userType: userProfile.userType,
        employeeStatus: userProfile.employeeStatus,
        isResignedEmployee: userProfile.isResignedEmployee,
        requiresSpecialApproval: userProfile.requiresSpecialApproval,
        department: userProfile.access?.departments?.[0] || 'general',
        province: userProfile.access?.geographic?.homeProvince || 'unknown',
        branch: userProfile.access?.geographic?.homeBranch || 'unknown',
        approvalLevel,
      },
      targetAudience:
        approvalLevel === 'branch_manager'
          ? 'branch_managers'
          : 'province_managers',
      priority: isResignedEmployee ? 'high' : 'normal', // High priority for resigned employees
      createdAt: Date.now(),
      status: 'active',
    };

    await app.firestore().collection('notifications').add(notification);

    console.log('📨 Notification sent to approvers');
  } catch (error) {
    console.warn('Failed to send notification to approvers:', error);
  }
};

/**
 * LOGIN USER - Clean Slate Only
 * Simplified logic with automatic migration for legacy users
 */
export const loginUser =
  (email, password, rememberMe = false) =>
  (dispatch) => {
    dispatch(requestLogin());

    app
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        let mUser = getFirebaseUserFromObject(userCredential);
        mUser = { ...mUser, password, lastLogin: Date.now() };

        try {
          // Load user data from Firestore
          const userDoc = await app
            .firestore()
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
                displayName:
                  userData.displayName ||
                  `${userData.firstName || ''} ${userData.lastName || ''}`,

                // Pending approval metadata
                isPendingApproval: true,
                approvalStatus: 'pending',
                isApproved: false,
                isActive: false,

                // Clean Slate structure for context (if available)
                access: userData.access || null,
                userType: userData.userType || 'new',
              };

              dispatch(receiveLogin(pendingUserData));
              return;
            }

            // Handle rejected/suspended users - Don't throw errors, let them see rejection screen
            if (statusValidation.isRejected) {
              console.log(
                '🔄 User rejected - setting up rejection screen:',
                user.uid
              );

              // Create rejected user profile for rejection screen
              const rejectedProfile = {
                uid: user.uid,
                email: userData.email || user.email,
                emailVerified: user.emailVerified,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                displayName: userData.displayName || user.displayName,

                // Clean Slate RBAC structure
                access: userData.access,

                // Status fields - show rejection
                isDev: userData.isDev || false,
                isApproved: false,
                isActive: false,
                approvalStatus: userData.approvalStatus || 'rejected',
                isPendingApproval: false,

                // Rejection details
                rejectedAt: userData.rejectedAt,
                rejectionReason: userData.rejectionReason,
                rejectedBy: userData.rejectedBy,
                rejectorName: userData.rejectorName,

                // User type and metadata
                userType: userData.userType || 'new',
                created: userData.created,
                updatedAt: userData.updatedAt || Date.now(),
              };

              console.log(
                '✅ Rejected user profile created for smooth rejection screen'
              );

              // Set up approval listener (in case status changes)
              setupApprovalListener(user.uid, dispatch);

              // Load provinces data
              await loadProvincesData(dispatch);

              // Dispatch login with rejection data - NO ERROR THROWN
              dispatch(receiveLogin(rejectedProfile, 'loginUser-rejected'));
              return; // Exit cleanly
            }

            if (statusValidation.isSuspended) {
              const suspensionReason =
                userData.suspensionReason || 'ไม่ระบุเหตุผล';
              let suspensionMessage = `บัญชีของคุณถูกระงับชั่วคราว\nเหตุผล: ${suspensionReason}`;

              if (userData.suspendedUntil) {
                const suspensionDate = new Date(
                  userData.suspendedUntil
                ).toLocaleDateString('th-TH');
                suspensionMessage += `\nระงับจนถึง: ${suspensionDate}`;
              }

              throw new Error(suspensionMessage);
            }

            // Check if user has Clean Slate structure
            if (!isValidCleanSlateUser(userData)) {
              console.log('🔄 Migrating legacy user to Clean Slate:', user.uid);

              // Auto-migrate to Clean Slate
              const { migrateToOrthogonalSystem } = await import(
                '../../utils/orthogonal-rbac'
              );
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

              await app
                .firestore()
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
              geographic: mUser.access?.geographic?.scope,
            });

            // Update last login time
            await app.firestore().collection('users').doc(user.uid).update({
              lastLogin: Date.now(),
              updatedAt: Date.now(),
            });
          }
        } catch (firestoreError) {
          console.error('Error loading user data:', firestoreError);
          // If it's a user status error, throw it
          if (
            firestoreError.message.includes('บัญชี') ||
            firestoreError.message.includes('ระงับ')
          ) {
            throw firestoreError;
          }
          // Otherwise, continue with basic auth
        }

        // Load provinces data
        await loadProvincesData(dispatch);

        dispatch(receiveLogin(mUser, 'loginUser'));
      })
      .catch((error) => {
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
      console.log(
        '✅ Provinces loaded:',
        Object.keys(provinces).length,
        'provinces'
      );
    } else {
      // Default provinces for development
      const defaultProvinces = {
        นครราชสีมา: {
          id: 'นครราชสีมา',
          provinceName: 'นครราชสีมา',
          provinceNameEn: 'Nakhon Ratchasima',
          isActive: true,
          isDefault: true,
        },
        นครสวรรค์: {
          id: 'นครสวรรค์',
          provinceName: 'นครสวรรค์',
          provinceNameEn: 'Nakhon Sawan',
          isActive: true,
          isDefault: false,
        },
      };
      dispatch(setProvinces(defaultProvinces));
    }
  } catch (error) {
    console.warn('Error loading provinces:', error);
    // Set minimal default as fallback
    const minimalProvinces = {
      นครราชสีมา: {
        id: 'นครราชสีมา',
        provinceName: 'นครราชสีมา',
        provinceNameEn: 'Nakhon Ratchasima',
        isActive: true,
        isDefault: true,
      },
    };
    dispatch(setProvinces(minimalProvinces));
  }
};

/**
 * LOGOUT USER
 */
export const logoutUser = () => (dispatch) => {
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
    .catch((error) => {
      console.warn(error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(logoutError(errorInfo.message));
    });
};

/**
 * FORGOT PASSWORD
 */
export const forgetPassword = (email) => (dispatch) => {
  dispatch(requestResetPassword());
  app
    .auth()
    .sendPasswordResetEmail(email)
    .then(() => {
      dispatch(receiveResetPassword());
    })
    .catch((error) => {
      console.warn(error);
      const errorInfo = FirebaseErrorHandler.interpret(error);
      dispatch(resetPasswordError(errorInfo.message));
    });
};

/**
 * VERIFY AUTH - Clean Slate Only
 * Simplified auth verification with automatic migration
 */
export const verifyAuth = () => (dispatch) => {
  dispatch(verifyRequest());

  app.auth().onAuthStateChanged(async (user) => {
    if (user !== null) {
      try {
        // FIXED: Check if approval listener already processed this user as rejected
        // Don't override rejection data from approval listener UNLESS user is now approved
        const currentReduxState = window.store?.getState?.()?.auth?.user;

        // Get fresh Firestore data to check current status
        const statusCheckDoc = await app
          .firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (statusCheckDoc.exists) {
          const statusCheckData = statusCheckDoc.data();
          const statusValidation = validateUserStatus(statusCheckData);

          // Only skip if user is STILL rejected in Firestore
          // If user is now approved/pending, continue with verification
          if (
            currentReduxState?.uid === user.uid &&
            currentReduxState?.approvalStatus === 'rejected' &&
            currentReduxState?.rejectedAt &&
            statusValidation.isRejected
          ) {
            console.log(
              '🔄 User still rejected in Firestore - skipping verifyAuth override'
            );
            dispatch(verifySuccess());
            return;
          }

          // If user status changed from rejected to approved/pending, continue verification
          if (
            currentReduxState?.approvalStatus === 'rejected' &&
            (statusValidation.isApproved || statusValidation.isPending)
          ) {
            console.log(
              '🎉 User status changed from rejected to approved/pending - proceeding with verification'
            );
          }
        }

        let mUser = getFirebaseUserFromObject(user);
        mUser = { ...mUser, lastLogin: Date.now() };

        // Load user data from Firestore
        const userDoc = await app
          .firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();

          // DEBUG: Log the actual Firestore data to understand the issue
          console.log('🔍 verifyAuth - Raw Firestore data:', {
            uid: user.uid,
            approvalStatus: userData.approvalStatus,
            isApproved: userData.isApproved,
            isActive: userData.isActive,
            rejectedAt: userData.rejectedAt,
            rejectionReason: userData.rejectionReason,
            rejectedBy: userData.rejectedBy,
          });

          // Validate user status
          const statusValidation = validateUserStatus(userData);

          console.log(
            '🔍 verifyAuth - Status validation result:',
            statusValidation
          );

          // Handle pending approval users - keep them signed in
          if (statusValidation.isPending) {
            console.log(
              '⏳ Pending approval user during verification:',
              user.uid
            );

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
              userType: userData.userType || 'new',
            };

            // Set up approval listener
            setupApprovalListener(user.uid, dispatch);

            // Load provinces data
            await loadProvincesData(dispatch);

            dispatch(receiveLogin(mUser, 'verifyAuth'));
            dispatch(verifySuccess());
            return;
          }

          // Handle rejected/suspended users - let them see rejection screen
          if (statusValidation.isRejected || statusValidation.isSuspended) {
            console.log(
              '❌ User rejected/suspended during verification - showing rejection screen:',
              user.uid
            );

            // Create rejected user profile for rejection screen
            const rejectedProfile = {
              uid: user.uid,
              email: userData.email || user.email,
              emailVerified: user.emailVerified,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              displayName: userData.displayName || user.displayName,

              // Clean Slate RBAC structure
              access: userData.access,

              // Status fields - show rejection
              isDev: userData.isDev || false,
              isApproved: false,
              isActive: false,
              approvalStatus: userData.approvalStatus || 'rejected',
              isPendingApproval: false,

              // Rejection details
              rejectedAt: userData.rejectedAt,
              rejectionReason: userData.rejectionReason,
              rejectedBy: userData.rejectedBy,

              // User type and metadata
              userType: userData.userType || 'new',
              created: userData.created,
              updatedAt: userData.updatedAt || Date.now(),
            };

            console.log('🔄 Rejected user profile for verification:', {
              uid: rejectedProfile.uid,
              approvalStatus: rejectedProfile.approvalStatus,
              rejectedAt: rejectedProfile.rejectedAt,
              rejectionReason: rejectedProfile.rejectionReason,
            });

            // Set up approval listener (in case status changes)
            setupApprovalListener(user.uid, dispatch);

            // Load provinces data
            await loadProvincesData(dispatch);

            dispatch(receiveLogin(rejectedProfile, 'verifyAuth-rejected'));
            dispatch(verifySuccess());
            return;
          }

          // Check if user has Clean Slate structure
          if (!isValidCleanSlateUser(userData)) {
            console.log(
              '🔄 Auto-migrating legacy user during verification:',
              user.uid
            );

            try {
              const { migrateToOrthogonalSystem } = await import(
                '../../utils/orthogonal-rbac'
              );
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

                await app
                  .firestore()
                  .collection('users')
                  .doc(user.uid)
                  .set(updatedUserData, { merge: false });

                userData = updatedUserData;
                console.log('✅ User auto-migrated during verification');
              } else {
                console.error(
                  '❌ Auto-migration failed during verification - invalid Clean Slate structure'
                );
                app.auth().signOut();
                dispatch(verifySuccess());
                return;
              }
            } catch (migrationError) {
              console.error(
                '❌ Auto-migration error during verification:',
                migrationError
              );
              app.auth().signOut();
              dispatch(verifySuccess());
              return;
            }
          }

          // Create final user object with Clean Slate structure
          mUser = {
            ...mUser,
            // Essential identity
            uid: user.uid,
            email: userData.email || user.email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || user.displayName,

            // Clean Slate RBAC structure
            access: userData.access,

            // Status fields
            isDev: userData.isDev || false,
            isApproved: userData.isApproved !== false,
            isActive: userData.isActive !== false,
            approvalStatus: userData.approvalStatus || 'approved',
            isPendingApproval: false,

            // Metadata
            created: userData.created,
            updatedAt: userData.updatedAt || Date.now(),
          };

          console.log('✅ Clean Slate user verified successfully:', {
            uid: mUser.uid,
            authority: mUser.access?.authority,
            geographic: mUser.access?.geographic?.scope,
          });

          // Load provinces data
          await loadProvincesData(dispatch);

          dispatch(receiveLogin(mUser, 'verifyAuth'));
        } else {
          // User document doesn't exist in Firestore
          console.error('❌ User document not found in Firestore:', user.uid);

          // FIXED: Don't immediately sign out new users - they might be in signup process
          // Check if this is a recently created user (within last 30 seconds)
          const userCreationTime = user.metadata?.creationTime;
          const isRecentlyCreated =
            userCreationTime &&
            Date.now() - new Date(userCreationTime).getTime() < 30000; // 30 seconds

          if (isRecentlyCreated) {
            console.log(
              '⏳ Recently created user - waiting for Firestore document...'
            );

            // Wait a bit and try again (max 3 attempts)
            let attempts = 0;
            const maxAttempts = 3;
            const retryDelay = 2000; // 2 seconds

            const retryCheck = async () => {
              attempts++;
              console.log(
                `🔄 Retry attempt ${attempts}/${maxAttempts} for user document...`
              );

              try {
                const retryDoc = await app
                  .firestore()
                  .collection('users')
                  .doc(user.uid)
                  .get();

                if (retryDoc.exists) {
                  console.log('✅ User document found on retry!');
                  const userData = retryDoc.data();

                  // 🔧 FIXED: Preserve Clean Slate structure during retry
                  // Don't use createUserProfile which creates legacy structure
                  const userProfile = {
                    // Essential identity
                    uid: user.uid,
                    email: userData.email || user.email,
                    emailVerified: user.emailVerified,
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    displayName: userData.displayName || user.displayName,

                    // 🔧 PRESERVE Clean Slate RBAC structure
                    access: userData.access,

                    // Status fields
                    isDev: userData.isDev || false,
                    isApproved: userData.isApproved === true,
                    isActive: userData.isActive === true,
                    approvalStatus: userData.approvalStatus || 'pending',
                    isPendingApproval: userData.approvalStatus === 'pending',

                    // User type and metadata
                    userType: userData.userType || 'new',
                    created: userData.created,
                    updatedAt: userData.updatedAt || Date.now(),
                  };

                  console.log('🔧 Retry: Preserved Clean Slate structure:', {
                    uid: userProfile.uid,
                    hasAccess: !!userProfile.access,
                    authority: userProfile.access?.authority,
                    isApproved: userProfile.isApproved,
                    isActive: userProfile.isActive,
                  });

                  dispatch(receiveLogin(userProfile, 'verifyAuth-retry'));
                  dispatch(verifySuccess());
                  return;
                }

                if (attempts < maxAttempts) {
                  setTimeout(retryCheck, retryDelay);
                } else {
                  console.error(
                    '❌ User document still not found after retries - signing out'
                  );
                  app.auth().signOut();
                  dispatch(verifySuccess());
                }
              } catch (error) {
                console.error('❌ Error during retry:', error);
                if (attempts >= maxAttempts) {
                  app.auth().signOut();
                  dispatch(verifySuccess());
                } else {
                  setTimeout(retryCheck, retryDelay);
                }
              }
            };

            setTimeout(retryCheck, retryDelay);
            return;
          } else {
            // User is not recently created - sign them out
            console.log(
              '🔄 User document not found and not recently created - signing out'
            );
            app.auth().signOut();
            dispatch(verifySuccess());
            return;
          }
        }
      } catch (error) {
        console.error('❌ Critical error verifying user auth:', error);
        console.error('🚨 Signing out user to prevent auth limbo state');
        app.auth().signOut();
        dispatch(verifySuccess());
        return;
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
  if (
    window.approvalListener &&
    typeof window.approvalListener === 'function'
  ) {
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

        // Handle reapplication status change (rejected → pending)
        if (statusValidation.isPending && userData.isReapplication) {
          console.log('🔄 User reapplied - updating to pending status');

          const reapplicationProfile = {
            uid: userId,
            email: userData.email,
            emailVerified: userData.emailVerified || false,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || '',

            // Clean Slate RBAC structure
            access: userData.access,

            // Status fields - show pending
            isDev: userData.isDev || false,
            isApproved: false,
            isActive: false,
            approvalStatus: 'pending',
            isPendingApproval: true,

            // Reapplication metadata
            isReapplication: userData.isReapplication,
            reappliedAt: userData.reappliedAt,
            improvementNote: userData.improvementNote,

            // Clear rejection details
            rejectedAt: null,
            rejectionReason: null,
            rejectedBy: null,

            // User type and metadata
            userType: userData.userType || 'new',
            created: userData.created,
            updatedAt: userData.updatedAt || Date.now(),
          };

          console.log('🔄 Updated profile for reapplication:', {
            uid: reapplicationProfile.uid,
            approvalStatus: reapplicationProfile.approvalStatus,
            isReapplication: reapplicationProfile.isReapplication,
            reappliedAt: reapplicationProfile.reappliedAt,
          });

          // Update Redux with reapplication data
          dispatch(receiveLogin(reapplicationProfile, 'reapplication-update'));

          // Continue listening for approval/rejection
        }

        // If user gets approved, reload profile and redirect
        if (
          !statusValidation.isPending &&
          statusValidation.isApproved &&
          statusValidation.isActive
        ) {
          console.log('✅ User approved! Reloading profile...');

          // Clean up listener first
          unsubscribe();
          window.approvalListener = null;

          // Create approved user profile immediately
          const approvedProfile = {
            uid: userId,
            email: userData.email,
            emailVerified: userData.emailVerified || false,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || '',

            // Clean Slate RBAC structure
            access: userData.access,

            // Status fields - show approved
            isDev: userData.isDev || false,
            isApproved: true,
            isActive: true,
            approvalStatus: 'approved',
            isPendingApproval: false,

            // Clear rejection details
            rejectedAt: null,
            rejectionReason: null,
            rejectedBy: null,

            // User type and metadata
            userType: userData.userType || 'new',
            created: userData.created,
            updatedAt: userData.updatedAt || Date.now(),
          };

          console.log('🎉 Updating Redux with approved profile:', {
            uid: approvedProfile.uid,
            approvalStatus: approvedProfile.approvalStatus,
            isApproved: approvedProfile.isApproved,
            isActive: approvedProfile.isActive,
          });

          // Update Redux immediately with approved profile
          dispatch(receiveLogin(approvedProfile, 'approval-listener-approved'));

          // Trigger verification to ensure complete state sync
          setTimeout(() => {
            dispatch(verifyAuth());
          }, 100);

          // Dispatch custom event for UI updates
          window.dispatchEvent(
            new CustomEvent('userApproved', {
              detail: { userId, userData: approvedProfile },
            })
          );
        }

        // If user gets rejected, update their profile but DON'T sign them out
        // Let them see the rejection screen
        if (statusValidation.isRejected || statusValidation.isSuspended) {
          console.log(
            '❌ User rejected/suspended - updating profile to show rejection screen'
          );

          // Update the user profile with rejection data
          const rejectedProfile = {
            uid: userId,
            email: userData.email,
            emailVerified: userData.emailVerified || false,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || '',

            // Clean Slate RBAC structure
            access: userData.access,

            // Status fields - show rejection
            isDev: userData.isDev || false,
            isApproved: false,
            isActive: false,
            approvalStatus: userData.approvalStatus || 'rejected',
            isPendingApproval: false,

            // Rejection details
            rejectedAt: userData.rejectedAt,
            rejectionReason: userData.rejectionReason,

            // User type and metadata
            userType: userData.userType || 'new',
            created: userData.created,
            updatedAt: userData.updatedAt || Date.now(),
          };

          console.log('🔄 Updated profile for rejection screen:', {
            uid: rejectedProfile.uid,
            approvalStatus: rejectedProfile.approvalStatus,
            rejectedAt: rejectedProfile.rejectedAt,
            rejectionReason: rejectedProfile.rejectionReason,
          });

          // Update Redux with rejection data so ApprovalStatus can show rejection screen
          dispatch(receiveLogin(rejectedProfile, 'rejection-update'));

          // Keep listener active - don't unsubscribe
          // User can still see rejection screen and potentially appeal
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
export const updateUser = (user) => ({
  type: USER_UPDATE,
  user,
});
