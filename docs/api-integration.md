# 🌐 API Integration – KBN

This document outlines the API integration architecture in the KBN platform, detailing how the application interacts with backend services, external APIs, and Firebase.

---

## 📋 Overview

KBN implements a service-based approach to API integration, abstracting backend communication into dedicated service modules. This architecture promotes maintainability, reusability, and separation of concerns throughout the application.

---

## 🏗️ Architecture

The API integration layer follows a multi-tier architecture:

```
┌─────────────────┐
│                 │
│  UI Components  │
│                 │
└────────┬────────┘
         │
         ▼
┌────────────────┐     ┌─────────────────┐
│                │     │                 │
│  Redux Actions │◀───▶│  API Services   │
│                │     │                 │
└────────────────┘     └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │                 │
                       │  Firebase / API │
                       │                 │
                       └─────────────────┘
```

---

## 📂 Key Files and Directories

| Path                     | Purpose                                        |
| ------------------------ | ---------------------------------------------- |
| `src/services/API/`      | Core API service layer                         |
| `src/services/firebase/` | Firebase service integrations                  |
| `src/navigation/api.js`  | API route configuration                        |
| `src/store/middlewares/` | API-related middleware (e.g., for auth tokens) |

---

## 🔄 API Service Layer

The API service layer provides a clean abstraction over backend communication:

### Service Structure

Each API domain has its own service module:

```javascript
// Example user service
export const userService = {
  // Get user profile
  async getProfile(userId) {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const response = await axios.put(`/api/users/${userId}`, profileData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  // Other user-related API methods...
};
```

### API Client Configuration

Base API client setup with interceptors:

```javascript
// API client configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Global error handling
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      store.dispatch(logoutUser());
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔥 Firebase Integration

The application integrates with Firebase services:

### Authentication

```javascript
// Firebase auth service
import { auth } from '../firebase/config';

export const firebaseAuthService = {
  // Sign in with email/password
  async signInWithEmailPassword(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  },

  // Sign up new user
  async signUpWithEmailPassword(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  }

  // Other auth methods...
};
```

### Firestore Database

```javascript
// Firestore service
import { db } from '../firebase/config';

export const firestoreService = {
  // Get document by ID
  async getDocument(collection, docId) {
    try {
      const docRef = doc(db, collection, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  },

  // Add new document
  async addDocument(collection, data) {
    try {
      const collectionRef = collection(db, collection);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  }

  // Other Firestore operations...
};
```

### Firebase Storage

```javascript
// Storage service
import { storage } from '../firebase/config';

export const storageService = {
  // Upload file
  async uploadFile(path, file) {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  },

  // Delete file
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      handleFirebaseError(error);
      throw error;
    }
  }

  // Other storage operations...
};
```

---

## 🎯 Custom Hooks for API Access

The application provides custom hooks to access API functionality from components:

```javascript
// Example custom hook for user data
export const useUserData = userId => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile(userId);
        setUserData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  return { userData, loading, error };
};
```

---

## 🔄 Integration with Firebase Cloud Functions

The application communicates with backend functionality via Firebase Cloud Functions:

```javascript
// Firebase Functions service
import { functions } from '../firebase/config';

export const functionsService = {
  // Call specific cloud function
  async callFunction(functionName, data) {
    try {
      const functionRef = httpsCallable(functions, functionName);
      const result = await functionRef(data);
      return result.data;
    } catch (error) {
      handleFunctionsError(error);
      throw error;
    }
  },

  // Example specific function call
  async processPayment(paymentDetails) {
    return this.callFunction('processPayment', paymentDetails);
  }
};
```

---

## 🔄 Real-time Data with Firebase

The application leverages Firebase's real-time capabilities:

```javascript
// Real-time listener hook
export const useRealtimeData = (collectionPath, query = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // Build query
    let collectionRef = collection(db, collectionPath);
    query.forEach(q => {
      collectionRef = where(collectionRef, q.field, q.operator, q.value);
    });

    // Set up listener
    const unsubscribe = onSnapshot(
      collectionRef,
      snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(items);
        setLoading(false);
        setError(null);
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    );

    // Clean up listener
    return () => unsubscribe();
  }, [collectionPath, JSON.stringify(query)]);

  return { data, loading, error };
};
```

---

## 🛡️ Error Handling

The application implements consistent error handling across API services:

```javascript
// Error handling utilities
export const handleApiError = error => {
  // Log error
  console.error('API Error:', error);

  // Parse error response
  const errorMessage = error.response?.data?.message || error.message || 'Unknown API error';

  // Optional: Send to error reporting service
  // reportError(error);

  return errorMessage;
};

export const handleFirebaseError = error => {
  // Log error
  console.error('Firebase Error:', error);

  // Map Firebase error codes to user-friendly messages
  const errorMap = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Invalid login credentials'
    // More error mappings...
  };

  const errorMessage = errorMap[error.code] || error.message || 'Unknown Firebase error';

  // Optional: Send to error reporting service
  // reportError(error);

  return errorMessage;
};
```

---

## 📝 Best Practices

1. **Centralize API configuration**: Keep base URLs, timeouts, and other settings in one place
2. **Use service abstractions**: Abstract API calls into domain-specific service modules
3. **Implement proper error handling**: Handle network errors, API errors, and Firebase-specific errors
4. **Cache results when appropriate**: Implement caching strategies for frequently accessed data
5. **Use interceptors for common concerns**: Handle authentication tokens, logging, etc., in interceptors
6. **Create custom hooks for components**: Abstract API data fetching into reusable hooks
7. **Validate API responses**: Ensure responses match expected schemas before using data
8. **Handle offline scenarios**: Implement offline-first strategies when possible
9. **Use environment variables**: Store API endpoints and keys in environment variables
10. **Document API services**: Maintain clear documentation of available services and methods

---

## 🧪 Testing API Integration

### Service Testing

```javascript
// Example service test
describe('userService', () => {
  beforeEach(() => {
    // Mock axios
    jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve({ data: mockUserData }));
  });

  it('should fetch user profile', async () => {
    const result = await userService.getProfile('user123');

    expect(axios.get).toHaveBeenCalledWith('/api/users/user123');
    expect(result).toEqual(mockUserData);
  });

  it('should handle errors correctly', async () => {
    // Mock error response
    axios.get.mockImplementation(() => Promise.reject(new Error('API Error')));

    await expect(userService.getProfile('user123')).rejects.toThrow('API Error');
  });
});
```

### Mock Service Factory

```javascript
// Mock service for testing components
export const createMockApiService = (mockData = {}) => ({
  getProfile: jest.fn().mockResolvedValue(mockData.profile || {}),
  updateProfile: jest.fn().mockResolvedValue({ success: true })
  // Other mocked methods...
});
```

---

## 🔗 Related Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [State Management Documentation](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/state-management.md)
- [Authentication Flow](/Users/arsomjin/Documents/Projects/KBN/kbn/docs/authentication-flow.md)
