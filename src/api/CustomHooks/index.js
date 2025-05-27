import { showLog, showWarn } from 'utils/functions';
import { useState, useCallback, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase';
import { goOffline, goOnline } from 'store/slices/networkSlice';
import { updateUser } from 'store/slices/authSlice';
import { distinctArr, sortArr } from 'utils/array';
import { setNotifications } from 'store/slices/dataSlice';

// Example: usage in reducers: setSomeCollection(dataObj, isPartial = false)
///////////////////////////////////////////////////////////
// 1) A NEW HOOK for syncing Firestore -> Redux in real-time
///////////////////////////////////////////////////////////
export const useCollectionSync = (collectionPath, setReduxAction) => {
  /**
   * collectionPath: e.g. 'users' or 'someCollection/someDoc/subCollection'
   * setReduxAction: e.g. setEmployees, setBanks, setUsers, etc.
   *
   * In your Redux action, define:
   *   export const setEmployees = (employees, isPartial = false) => ({
   *     type: GET_EMPLOYEES,
   *     employees,
   *     isPartial
   *   });
   *
   * Then in the reducer, handle partial merges if isPartial === true.
   */
  const { firestore } = useContext(FirebaseContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!collectionPath) return;

    // Helper: parse a slash-delimited path
    const parsePath = (db, path) => {
      let ref = db;
      const segments = path.split('/');
      segments.forEach((seg, i) => {
        ref = i % 2 === 0 ? ref.collection(seg) : ref.doc(seg);
      });
      return ref;
    };

    const ref = parsePath(firestore, collectionPath);
    let unsubscribe = null;

    // 1) Do an initial one-time fetch of the entire collection/doc
    const initialFetch = async () => {
      try {
        const snap = await ref.get();
        // If it's a collection, snap.docs exists; if it's a single doc, snap.data() exists
        if (snap.docs) {
          // It's a collection
          let fullData = {};
          snap.forEach((doc) => {
            fullData[doc.id] = { ...doc.data(), _key: doc.id };
          });
          // Dispatch a "full set" to Redux
          dispatch(setReduxAction(fullData, false));
        } else if (snap.exists) {
          // It's a single doc
          const docData = { ...snap.data(), _key: snap.id };
          dispatch(setReduxAction({ [snap.id]: docData }, false));
        }
      } catch (error) {
        showWarn('Initial fetch error', error);
      }
    };

    // 2) Real-time listener merges changes
    const listenChanges = () => {
      unsubscribe = ref.onSnapshot(
        (snapshot) => {
          // For collections
          if (snapshot.docChanges) {
            let changesObj = {};
            snapshot.docChanges().forEach((change) => {
              const docId = change.doc.id;
              if (change.type === 'removed') {
                changesObj[docId] = null; // indicates removal
              } else {
                changesObj[docId] = { ...change.doc.data(), _key: docId };
              }
            });
            // Dispatch a "partial update" to Redux
            dispatch(setReduxAction(changesObj, true));
          }
          // For single doc usage, snapshot.exists
          else if (snapshot.exists) {
            const docData = { ...snapshot.data(), _key: snapshot.id };
            dispatch(setReduxAction({ [snapshot.id]: docData }, true));
          }
        },
        (err) => showWarn('onSnapshot error', err),
      );
    };

    initialFetch().then(listenChanges);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionPath, firestore, dispatch, setReduxAction]);
};

const useTemplateHook = () => {
  const { firestore, api } = useContext(FirebaseContext);
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });

  useEffect(() => {
    const handleUpdates = (snap) => {
      const users = {};
      snap.docChanges().forEach(function (change) {
        if (change.type === 'added') {
          showLog('added', change.doc.data());
        }
        if (change.type === 'modified') {
          showLog('modified', change.doc.data());
        }
        if (change.type === 'removed') {
          showLog('removed', change.doc.data());
        }
        let mData = change.doc.data();
        users[change.doc.id] = mData;
      });
      setData({
        error: null,
        loading: false,
        data: users,
      });
    };

    const query = firestore.collection('users');
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
  }, [firestore]);

  return data;
};

export const useFunctionAsState = (fn) => {
  const [val, setVal] = useState(() => fn);

  const setFunc = useCallback((fnc) => {
    setVal(() => fnc);
  }, []);

  return [val, setFunc];
};

export const useCombinedRefs = (...refs) => {
  const targetRef = useRef();

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
};

const shallowPartialCompare = (obj, partialObj) =>
  Object.keys(partialObj).every((key) => obj.hasOwnProperty(key) && obj[key] === partialObj[key]);

export const useMergeState = (initial) => {
  const [state, setState] = useState(initial);
  const setMergedState = (newIncomingState) =>
    setState((prevState) => {
      const newState =
        typeof newIncomingState === 'function' ? newIncomingState(prevState) : newIncomingState;
      return shallowPartialCompare(prevState, newState) ? prevState : { ...prevState, ...newState };
    });
  return [state, setMergedState];
};

export const useCollectionListener = (collection, wheres, limit, orderBy) => {
  const { firestore } = useContext(FirebaseContext);
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });

  useEffect(() => {
    const handleUpdate = (snap) => {
      let res = {};
      snap.forEach((doc) => {
        res[doc.id] = { ...doc.data(), _key: doc.id };
      });
      setData({ error: null, loading: false, data: res });
    };
    let updateRef = firestore;
    collection.split('/').map((txt, n) => {
      if (n % 2 === 0) {
        updateRef = updateRef.collection(txt);
      } else {
        updateRef = updateRef.doc(txt);
      }
      return txt;
    });
    if (wheres) {
      wheres.map((wh) => {
        // console.log({ wh });
        updateRef = updateRef.where(wh[0], wh[1], wh[2]);
        return wh;
      });
    }
    if (orderBy) {
      updateRef = updateRef.orderBy(orderBy);
    }
    if (limit) {
      updateRef = updateRef.limt(limit);
    }

    const unsubscribe = updateRef.onSnapshot(
      (snapshot) => handleUpdate(snapshot),
      (error) => {
        setData({
          error,
          loading: false,
          data: {},
        });
      },
    );

    return unsubscribe;
  }, [collection, firestore, limit, orderBy, wheres]);

  return data;
};

export const useCollectionChangeListener = (collection) => {
  const { firestore } = useContext(FirebaseContext);
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });

  useEffect(() => {
    const handleUpdate = (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('Added: ', change.doc.data());
        }
        if (change.type === 'modified') {
          console.log('Modified: ', change.doc.data());
        }
        if (change.type === 'removed') {
          console.log('Removed: ', change.doc.data());
        }
        setData({
          error: null,
          loading: false,
          data: { ...change.doc.data(), _key: change.doc.id },
        });
      });
    };
    let updateRef = firestore;
    collection.split('/').map((txt, n) => {
      if (n % 2 === 0) {
        updateRef = updateRef.collection(txt);
      } else {
        updateRef = updateRef.doc(txt);
      }
      return txt;
    });
    const unsubscribe = updateRef.onSnapshot(
      (snapshot) => handleUpdate(snapshot),
      (error) => {
        setData({
          error,
          loading: false,
          data: {},
        });
      },
    );

    return unsubscribe;
  }, [collection, firestore]);

  return data;
};

export const useDocListener = (collection, doc) => {
  const { firestore } = useContext(FirebaseContext);
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: {},
  });

  useEffect(() => {
    const handleUpdate = (doc) => {
      setData({
        error: null,
        loading: false,
        data: { ...doc.data(), _key: doc.id },
      });
    };
    let updateRef = firestore.collection(collection);
    doc.split('/').map((txt, n) => {
      if (n % 2 === 0) {
        updateRef = updateRef.doc(txt);
      } else {
        updateRef = updateRef.collection(txt);
      }
      return txt;
    });

    const unsubscribe = updateRef.onSnapshot(
      (snapshot) => handleUpdate(snapshot),
      (error) => {
        setData({
          error,
          loading: false,
          data: {},
        });
      },
    );

    return unsubscribe && unsubscribe();
  }, [collection, doc, firestore]);

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
    const unsubscribe = userStatusRef.onSnapshot(
      (doc) => {
        console.log('doc', doc.data());
        if (doc.exists) {
          const isOnline = doc.data().state === 'online';
          setOnline(isOnline);
          dispatch(isOnline ? goOnline() : goOffline());
        }
      },
      (err) => showWarn(err),
    );
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
