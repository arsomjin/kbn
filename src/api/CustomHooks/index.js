// src/api/CustomHooks/index.js
//
// Custom React hooks for Firestore, Redux, and app utilities.
// All hooks use Firebase Modular SDK, Redux Toolkit, and follow KBN project guidelines.

import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  getDocs,
  getDoc,
  query as fbQuery,
  where,
  orderBy as fbOrderBy,
  limit as fbLimit,
} from 'firebase/firestore';
import { FirebaseContext } from '../../firebase';
import { goOffline, goOnline } from 'store/slices/networkSlice';
import { updateUser } from 'store/slices/authSlice';
import { distinctArr, sortArr } from 'utils/array';
import { setNotifications } from 'store/slices/dataSlice';

/**
 * Syncs a Firestore collection or document to Redux in real-time.
 * @param {string} collectionPath - Firestore path (e.g. 'users' or 'company/employees')
 * @param {function} setReduxAction - Redux action creator to update the store
 */
export const useCollectionSync = (collectionPath, setReduxAction) => {
  const db = getFirestore();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!collectionPath) return;

    // Parse a slash-delimited path to Firestore ref
    const parsePath = (db, path) => {
      const segments = path.split('/');
      let ref = db;
      for (let i = 0; i < segments.length; i++) {
        ref = i % 2 === 0 ? collection(ref, segments[i]) : doc(ref, segments[i]);
      }
      return ref;
    };

    const ref = parsePath(db, collectionPath);
    let unsubscribe = null;

    // Initial fetch
    const initialFetch = async () => {
      try {
        if (ref.type === 'collection') {
          const snap = await getDocs(ref);
          let fullData = {};
          snap.forEach((docSnap) => {
            fullData[docSnap.id] = { ...docSnap.data(), _key: docSnap.id };
          });
          dispatch(setReduxAction(fullData, false));
        } else {
          const docSnap = await getDoc(ref);
          if (docSnap.exists()) {
            dispatch(
              setReduxAction({ [docSnap.id]: { ...docSnap.data(), _key: docSnap.id } }, false),
            );
          }
        }
      } catch (error) {
        // Optionally handle error with i18n modal
      }
    };

    // Real-time listener
    const listenChanges = () => {
      unsubscribe = onSnapshot(ref, (snapshot) => {
        if (snapshot.docChanges) {
          let changesObj = {};
          snapshot.docChanges().forEach((change) => {
            const docId = change.doc.id;
            if (change.type === 'removed') {
              changesObj[docId] = null;
            } else {
              changesObj[docId] = { ...change.doc.data(), _key: docId };
            }
          });
          dispatch(setReduxAction(changesObj, true));
        } else if (snapshot.exists) {
          const docData = { ...snapshot.data(), _key: snapshot.id };
          dispatch(setReduxAction({ [snapshot.id]: docData }, true));
        }
      });
    };

    initialFetch().then(listenChanges);
    return () => unsubscribe && unsubscribe();
  }, [collectionPath, db, dispatch, setReduxAction]);
};

/**
 * Combines multiple refs into one for forwarding.
 * @param  {...any} refs
 * @returns {object} Combined ref
 */
export const useCombinedRefs = (...refs) => {
  const targetRef = useRef();
  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);
  return targetRef;
};

/**
 * Like useState, but merges objects shallowly.
 * @param {object} initial
 * @returns {[object, function]}
 */
export const useMergeState = (initial) => {
  const [state, setState] = useState(initial);
  const setMergedState = (newIncomingState) =>
    setState((prevState) => {
      const newState =
        typeof newIncomingState === 'function' ? newIncomingState(prevState) : newIncomingState;
      // Shallow compare
      for (const key in newState) {
        if (!(key in prevState) || prevState[key] !== newState[key]) {
          return { ...prevState, ...newState };
        }
      }
      return prevState;
    });
  return [state, setMergedState];
};

export const useFunctionAsState = (fn) => {
  const [val, setVal] = useState(() => fn);

  const setFunc = useCallback((fnc) => {
    setVal(() => fnc);
  }, []);

  return [val, setFunc];
};

/**
 * Helper to parse a Firestore path string into a reference using the modular SDK.
 * @param {object} db - Firestore instance
 * @param {string} path - Slash-delimited path
 * @returns {CollectionReference|DocumentReference}
 */
function getFirestoreRef(db, path) {
  const segments = path.split('/');
  let ref = db;
  for (let i = 0; i < segments.length; i++) {
    ref = i % 2 === 0 ? collection(ref, segments[i]) : doc(ref, segments[i]);
  }
  return ref;
}

/**
 * Listen to a Firestore collection in real-time and return its data.
 * @param {string} collectionPath - Firestore collection path (e.g. 'users' or 'company/employees')
 * @param {Array} wheres - Optional Firestore where clauses, e.g. [[field, op, value], ...]
 * @param {number} limit - Optional limit
 * @param {string|Array} orderBy - Optional order by field or array of [field, direction]
 * @returns {object} { error, loading, data }
 */
export const useCollectionListener = (collectionPath, wheres, limit, orderBy) => {
  const db = getFirestore();
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });

  useEffect(() => {
    if (!collectionPath) return;
    let ref = getFirestoreRef(db, collectionPath);
    let q = ref;

    // Build query
    const queryConstraints = [];
    if (Array.isArray(wheres)) {
      wheres.forEach((wh) => {
        if (Array.isArray(wh) && wh.length === 3) {
          queryConstraints.push(where(wh[0], wh[1], wh[2]));
        }
      });
    }
    if (orderBy) {
      if (Array.isArray(orderBy) && orderBy.length === 2) {
        queryConstraints.push(fbOrderBy(orderBy[0], orderBy[1]));
      } else if (typeof orderBy === 'string') {
        queryConstraints.push(fbOrderBy(orderBy));
      }
    }
    if (typeof limit === 'number' && limit > 0) {
      queryConstraints.push(fbLimit(limit));
    }
    if (queryConstraints.length > 0) {
      q = fbQuery(ref, ...queryConstraints);
    }

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        let res = {};
        snap.forEach((doc) => {
          res[doc.id] = { ...doc.data(), _key: doc.id };
        });
        setData({ error: null, loading: false, data: res });
      },
      (error) => {
        setData({ error, loading: false, data: {} });
      },
    );
    return () => unsubscribe();
  }, [collectionPath, db, JSON.stringify(wheres), limit, JSON.stringify(orderBy)]);

  return data;
};

/**
 * Listen to Firestore collection changes (docChanges) in real-time.
 * @param {string} collectionPath - Firestore collection path
 * @returns {object} { error, loading, data }
 */
export const useCollectionChangeListener = (collectionPath) => {
  const db = getFirestore();
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });
  useEffect(() => {
    if (!collectionPath) return;
    let ref = getFirestoreRef(db, collectionPath);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        snap.docChanges().forEach((change) => {
          setData({
            error: null,
            loading: false,
            data: { ...change.doc.data(), _key: change.doc.id },
          });
        });
      },
      (error) => {
        setData({ error, loading: false, data: {} });
      },
    );
    return () => unsubscribe();
  }, [collectionPath, db]);
  return data;
};

/**
 * Listen to a Firestore document in real-time and return its data.
 * @param {string} collectionPath - Firestore collection path
 * @param {string} docPath - Firestore document path (relative to collection)
 * @returns {object} { error, loading, data }
 */
export const useDocListener = (collectionPath, docPath) => {
  const db = getFirestore();
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });
  useEffect(() => {
    if (!collectionPath || !docPath) return;
    let ref = getFirestoreRef(db, collectionPath);
    ref = doc(ref, docPath);
    const unsubscribe = onSnapshot(
      ref,
      (docSnap) => {
        setData({
          error: null,
          loading: false,
          data: { ...docSnap.data(), _key: docSnap.id },
        });
      },
      (error) => {
        setData({ error, loading: false, data: {} });
      },
    );
    return () => unsubscribe();
  }, [collectionPath, docPath, db]);
  return data;
};

export const useCollectionSize = (collection) => {
  const { api } = useContext(FirebaseContext);
  const [size, setSize] = useState(0);
  useEffect(() => {
    const getSize = async () => {
      let parts_size = await api.getCollectionSize(collection);
      setSize(parts_size);
    };
    getSize();
  }, [api, collection]);
  return size;
};

export const useOnlineStatus = (uid) => {
  const { firestore } = useContext(FirebaseContext);
  const dispatch = useDispatch();
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const userStatusRef = firestore.collection('status').doc(uid);
    const unsubscribe = userStatusRef.onSnapshot((doc) => {
      console.log('doc', doc.data());
      if (doc.exists) {
        const isOnline = doc.data().state === 'online';
        setOnline(isOnline);
        dispatch(isOnline ? goOnline() : goOffline());
      }
    });
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [dispatch, firestore, uid]);
  return online;
};

export const useSelfListener = () => {
  const { firestore, api } = useContext(FirebaseContext);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userGroups } = useSelector((state) => state.data);
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });

  useEffect(() => {
    const handleUpdates = (snap) => {
      // showLog('SELF_LISTENER', snap);
      snap.docChanges().forEach(function (change) {
        if (change.type === 'modified') {
          var msg = 'User ' + change.doc.id + ' is modified.';
          let changeUser = change.doc.data();
          let mUser = { ...changeUser.auth, ...changeUser };
          delete mUser.auth;
          if (!!mUser.group && !!userGroups && userGroups[mUser.group]) {
            let mPermissions = {};
            let mPermCats = {};
            Object.keys(userGroups[mUser.group].permissions)
              .filter((l) => userGroups[mUser.group].permissions[l])
              .map((key) => {
                mPermissions[key] = true;
                return key;
              });
            mUser.permissions = mPermissions;
            Object.keys(userGroups[mUser.group].permCats)
              .filter((l) => userGroups[mUser.group].permCats[l])
              .map((permKey) => {
                mPermCats[permKey] = true;
                return permKey;
              });
            mUser.permCats = mPermCats;
          }
          dispatch(updateUser(mUser));
          setData({
            data: mUser,
            loading: false,
            error: null,
          });
        }
      });
    };
    const query = firestore.collection('users').where('auth.uid', '==', user.uid);
    let unsubscribe = query.onSnapshot(handleUpdates, (error) =>
      setData({
        error,
        loading: false,
        data: {},
      }),
    );
    return () => {
      unsubscribe && unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
};

export const useStatusListener = () => {
  const { firestore } = useContext(FirebaseContext);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState({
    error: null,
    loading: true,
    isOnline: true,
  });

  useEffect(() => {
    const handleUpdates = (doc) => {
      // showLog('STATUS_UPDATE', doc.data());
      if (doc.exists) {
        // const isOnline = doc.data().state === 'online';
        // dispatch(isOnline ? goOnline() : goOffline());
        dispatch(goOnline());
        setData({
          error: null,
          loading: false,
          isOnline: true,
        });
      } else {
        dispatch(goOffline());
        setData({
          error: null,
          loading: false,
          isOnline: false,
        });
      }
    };

    const query = firestore.collection('status').doc(user.uid);
    let unsubscribe = query.onSnapshot(handleUpdates, (error) => {
      if (error?.message && error.message.indexOf('offline') > -1) {
        dispatch(goOffline());
      }
      setData({
        error,
        loading: false,
        isOnline: false,
      });
    });
    return () => {
      unsubscribe && unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
};

export const useSelfUpdate = () => {
  const { firestore, api } = useContext(FirebaseContext);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { device } = useSelector((state) => state.global);
  const { userGroups } = useSelector((state) => state.data);
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });

  useEffect(() => {
    const handleUpdates = (doc) => {
      // showLog('SELF_UPDATE');
      if (doc.exists) {
        let cUser = JSON.parse(JSON.stringify(doc.data()));
        let mUser = { ...cUser.auth, ...cUser, ...user };
        delete mUser.auth;
        if (!!userGroups && !!mUser.group && userGroups[mUser.group]) {
          let mPermissions = {};
          let mPermCats = {};
          Object.keys(userGroups[mUser.group].permissions)
            .filter((l) => userGroups[mUser.group].permissions[l])
            .map((key) => {
              mPermissions[key] = true;
              return key;
            });
          mUser.permissions = mPermissions;
          Object.keys(userGroups[mUser.group].permCats)
            .filter((l) => userGroups[mUser.group].permCats[l])
            .map((permKey) => {
              mPermCats[permKey] = true;
              return permKey;
            });
          mUser.permCats = mPermCats;
        }
        if (device && typeof device.isBrowser !== 'undefined') {
          mUser.device = device;
          query.update({ device });
        }
        dispatch(updateUser(mUser));
        // Record device.
        // showLog('device', device);
        setData({
          error: null,
          loading: false,
          data: mUser,
        });
      }
    };

    const query = firestore.collection('users').doc(user.uid);
    query.get().then(
      (doc) => handleUpdates(doc),
      (error) =>
        setData({
          error,
          loading: false,
          data: {},
        }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
};

export const useNotificationAdd = () => {
  const { firestore, api } = useContext(FirebaseContext);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { group, department, branch } = user;
  const notificationsRef = useRef([]);
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });

  useEffect(() => {
    const handleUpdates = (snap) => {
      let messages = [];
      let notifArr = [];
      snap.docChanges().forEach(function (change) {
        // showLog({ notification_change: change });
        if (change.type === 'added') {
          // showLog('current_notif', notificationsRef.current);
          // showLog('added', { ...change.doc.data(), messageId: change.doc.id });
          let message = change.doc.data();
          let isNew = notificationsRef.current.findIndex((l) => l.messageId === change.doc.id) < 0;
          if (isNew) {
            // showLog('NOTIFICATION_ADD', change.doc.id);
            message.messageId = change.doc.id;
            messages.push(message);
            messages = messages.filter(
              (l) =>
                ((l.group && l.group === group) || !l.group) &&
                ((l.branch && l.branch === branch) || !l.branch) &&
                ((l.department && l.department === department) || !l.department),
            );
            notifArr = distinctArr(
              [...notificationsRef.current, ...messages],
              ['messageId', 'time'],
            );
            notifArr = sortArr(notifArr, '-time');
            dispatch(setNotifications(notifArr.slice(0, 3)));
            notificationsRef.current = notifArr.slice(0, 3);
          }
        }
      });
      setData({
        error: null,
        loading: false,
        data: notifArr.slice(0, 3),
      });
    };

    const query = firestore.collection('messages').orderBy('time', 'desc').limit(6);
    let unsubscribe = query.onSnapshot(handleUpdates, (error) =>
      setData({
        error,
        loading: false,
        data: {},
      }),
    );
    return () => {
      unsubscribe && unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
};
