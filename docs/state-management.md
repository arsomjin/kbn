# 🔄 State Management – KBN

This document outlines the state management architecture in the KBN platform, focusing on Redux implementation, data flow patterns, and best practices for managing application state.

---

## 📋 Overview

KBN uses Redux with Redux Toolkit for centralized state management, implementing a predictable state container that follows strict unidirectional data flow. This approach provides a consistent way to manage application state and ensures components receive only the data they need.

---

## 🏗️ Architecture

The state management architecture follows a slice-based approach with Redux Toolkit:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│ UI Components   │────▶│ Redux Actions   │────▶│   Reducers      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
        ▲                                                │
        │                                                ▼
┌───────┴───────┐     ┌─────────────────┐     ┌─────────────────┐
│                │     │                 │     │                 │
│ Selectors      │◀────│   Redux Store   │◀────│  Middleware     │
│                │     │                 │     │                 │
└────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 🧩 Store Structure

The Redux store is organized into logical slices that correspond to different domains in the application:

```javascript
// Store structure (simplified)
{
  auth: {
    user: { /* user data */ },
    isAuthenticated: true,
    loading: false,
    error: null
  },
  profile: {
    data: { /* profile data */ },
    loading: false,
    error: null
  },
  notifications: {
    items: [ /* notification objects */ ],
    unreadCount: 5,
    loading: false
  },
  // Other slices...
}
```

---

## 📂 Key Files and Directories

| Path                          | Purpose                                           |
| ----------------------------- | ------------------------------------------------- |
| `src/store/index.js`          | Redux store configuration and initialization      |
| `src/store/persistConfig.js`  | Configuration for Redux-persist                   |
| `src/store/combineReducer.js` | Root reducer composition                          |
| `src/store/slices/`           | Redux Toolkit slices (state + reducers + actions) |
| `src/store/middlewares/`      | Custom Redux middlewares                          |

---

## 🔄 Data Flow

### 1. Action Dispatch

Actions are dispatched from components to signal state changes:

```jsx
// Example action dispatch
const LoginForm = () => {
  const dispatch = useDispatch();

  const handleLogin = credentials => {
    dispatch(loginUser(credentials));
  };

  // Component implementation
};
```

### 2. Middleware Processing

Middleware intercepts actions for side effects (API calls, logging, etc.):

```javascript
// Example Redux Thunk middleware action
export const fetchUserProfile = userId => async dispatch => {
  dispatch(profileFetchStarted());
  try {
    const profile = await firebaseService.getUserProfile(userId);
    dispatch(profileFetchSuccess(profile));
  } catch (error) {
    dispatch(profileFetchFailed(error.message));
  }
};
```

### 3. Reducer Updates

Reducers handle actions and update state accordingly:

```javascript
// Example slice with reducer
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    loginStart: state => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
    // Other reducers...
  }
});
```

### 4. State Selection and Consumption

Components access state via selectors:

```jsx
// Example state consumption with selector
const UserProfileCard = () => {
  const user = useSelector(state => state.auth.user);
  const { data: profile, loading } = useSelector(state => state.profile);

  if (loading) return <LoadingSpinner />;

  return (
    <Card>
      <h2>{user.displayName}</h2>
      {profile && (
        <>
          <p>Role: {profile.role}</p>
          {/* Other profile data */}
        </>
      )}
    </Card>
  );
};
```

---

## 🔄 State Persistence

KBN uses Redux-persist to maintain state across page reloads:

```javascript
// Simplified persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'] // Only persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
    }
  })
});

export const persistor = persistStore(store);
```

---

## 🧪 Testing Redux Logic

The application includes patterns for testing Redux components:

### Action Creator Tests

```javascript
// Example action creator test
describe('auth actions', () => {
  it('should create an action to log in a user', () => {
    const userData = { id: '123', name: 'Test User' };
    const expectedAction = {
      type: 'auth/loginSuccess',
      payload: userData
    };
    expect(loginSuccess(userData)).toEqual(expectedAction);
  });
});
```

### Reducer Tests

```javascript
// Example reducer test
describe('auth reducer', () => {
  it('should handle loginSuccess', () => {
    const initialState = {
      user: null,
      isAuthenticated: false,
      loading: true,
      error: null
    };
    const userData = { id: '123', name: 'Test User' };
    const nextState = authReducer(initialState, loginSuccess(userData));

    expect(nextState).toEqual({
      user: userData,
      isAuthenticated: true,
      loading: false,
      error: null
    });
  });
});
```

### Thunk Tests

```javascript
// Example thunk test
describe('fetchUserProfile thunk', () => {
  it('dispatches profileFetchSuccess when API call succeeds', async () => {
    const mockProfile = { name: 'Test User', role: 'ADMIN' };
    firebaseService.getUserProfile = jest.fn().mockResolvedValue(mockProfile);

    const dispatch = jest.fn();
    await fetchUserProfile('user123')(dispatch);

    expect(dispatch).toHaveBeenCalledWith(profileFetchStarted());
    expect(dispatch).toHaveBeenCalledWith(profileFetchSuccess(mockProfile));
  });
});
```

---

## 🔗 Integration with React

The application uses React-Redux hooks throughout the component tree:

```jsx
// Common React-Redux hook usage
import { useSelector, useDispatch } from 'react-redux';
import { someAction } from '../store/slices/someSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const someData = useSelector(state => state.some.data);

  const handleSomeEvent = () => {
    dispatch(someAction(payload));
  };

  return (
    // Component rendering using someData
  );
};
```

---

## 📝 Best Practices

1. **Use selector functions**: Create reusable selectors for accessing state
2. **Keep slices focused**: Each slice should manage a specific domain of the application
3. **Normalize complex data**: Use normalized state shapes for relational data
4. **Use Redux Toolkit**: Leverage createSlice for reducing boilerplate code
5. **Apply careful persistence**: Only persist what's necessary to avoid bloated storage
6. **Handle async logic consistently**: Use thunks or other middleware for side effects
7. **Document state shape**: Maintain clear documentation of slice structures
8. **Test Redux logic**: Write tests for actions, reducers, and async operations
9. **Optimize renders**: Use memoization and selective state selection to prevent unnecessary re-renders

---

## 🛠️ Common Patterns

### Loading States

```javascript
// Loading state pattern
{
  data: [],
  loading: false,
  error: null
}

// Actions
const fetchDataStart = () => ({ loading: true, error: null });
const fetchDataSuccess = (data) => ({ data, loading: false });
const fetchDataFailure = (error) => ({ error, loading: false });
```

### Error Handling

```javascript
// Error handling pattern
try {
  dispatch(actionStart());
  const result = await apiCall();
  dispatch(actionSuccess(result));
} catch (error) {
  dispatch(actionFailure(error.message));
  // Optional: Log error or show notification
}
```

### Normalized Data

```javascript
// Normalized data pattern
{
  entities: {
    users: {
      '123': { id: '123', name: 'Alice' },
      '456': { id: '456', name: 'Bob' }
    },
    posts: {
      '789': { id: '789', title: 'First Post', authorId: '123' }
    }
  },
  ids: ['123', '456']
}
```

---

## 🔗 Related Documentation

- [Folder Structure](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/structure.md)
- [Authentication Flow](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/authentication-flow.md)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Best Practices](https://redux.js.org/style-guide)
