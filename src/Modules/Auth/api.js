export const getFirebaseUserFromObject = userObject => {
  let mUser =
    !!userObject.User && !!userObject.User.uid
      ? userObject.User
      : !!userObject?.User && !!userObject.User?._user && !!userObject.User._user?.uid
        ? userObject.User._user
        : !!userObject?._user && !!userObject._user?.uid
          ? userObject._user
          : !!userObject?.user && !!userObject.user?._user && !!userObject.user._user?.uid
            ? userObject.user._user
            : !!userObject?.user && !!userObject.user?.uid
              ? userObject.user
              : !!userObject?.user && !!userObject.user?.User && !!userObject.user.User?.uid
                ? userObject.user.User
                : !!userObject?.user && !!userObject.user?.User && !!userObject.user.User?._user
                  ? userObject.user.User._user
                  : userObject?.uid
                    ? userObject
                    : userObject;
  const {
    uid,
    displayName,
    email,
    emailVerified,
    isAnonymous,
    // metadata,
    phoneNumber,
    photoURL
  } = mUser;
  return {
    uid,
    displayName,
    email,
    emailVerified,
    isAnonymous,
    // metadata,
    phoneNumber,
    photoURL
  };
};

export const getAuthErrorMessage = error => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'อีเมลนี้ ได้ลงทะเบียนในระบบแล้ว';
    case 'auth/invalid-email':
      return 'อีเมลไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง';
    case 'auth/wrong-password':
      return 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง';
    case 'auth/weak-password':
      return 'รหัสผ่านง่ายเกินไป';
    case 'auth/too-many-requests':
      return 'พยายามเข้าสู่ระบบไม่สำเร็จหลายครั้งเกินไป โปรดลองอีกครั้งในภายหลัง';
    case 'auth/user-not-found':
      return 'ไม่พบผู้ใช้งานในระบบ กรุณาลงทะเบียน';
    case 'auth/network-request-failed':
      return 'การสื่อสารขัดข้อง';
    default:
      return error.message;
  }
};
