import { collection, doc, getDoc, getDocs, DocumentSnapshot, query, orderBy, startAfter, limit } from 'firebase/firestore';
import { firestore } from './firebase';
import type { User } from '../types/user';
import { RoleType, UserStatus, UserType } from '../types/user';

interface FirestoreUserDocument {
  auth: {
    uid: string;
    created: number;
    displayName: string;
    email: string;
    emailVerified?: boolean;
    firstName?: string;
    lastName?: string;
    isAnonymous?: boolean;
    lastLogin?: number;
    phoneNumber?: string | null;
    photoURL?: string | null;
  };
  status: string; // Will be cast to UserStatus
  role: string; // Will be cast to RoleType
  type: string; // Will be cast to UserType
  provinceId: string;
  deleted: boolean;
  created: number;
  updated: number;
  inputBy: string;
  employeeInfo?: {
    employeeId: string;
    employeeCode?: string;
    department?: string;
    position?: string;
    branch?: string;
    workBegin?: string | null;
    workEnd?: string | null;
  };
  visitorInfo?: {
    purpose: string;
    organization?: string;
    startDate: string;
    endDate?: string | null;
  };
}

const transformFirestoreUser = (doc: DocumentSnapshot): User => {
  const data = doc.data() as FirestoreUserDocument;
  return {
    ...data,
    id: doc.id,
    status: data.status as UserStatus,
    role: data.role as RoleType,
    type: data.type as UserType,
  };
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const snapshot = await getDocs(collection(firestore, 'users'));
    return snapshot.docs.map(transformFirestoreUser);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<User> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return transformFirestoreUser(userDoc);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const getUsersWithPagination = async (
  lastDoc: DocumentSnapshot | null,
  pageSize: number = 10
): Promise<{ users: User[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(collection(firestore, 'users'), orderBy('created', 'desc'), limit(pageSize));
    
    if (lastDoc) {
      q = query(collection(firestore, 'users'), orderBy('created', 'desc'), startAfter(lastDoc), limit(pageSize));
    }

    const snapshot = await getDocs(q);
    const users: User[] = [];
    let lastDocument: DocumentSnapshot | null = null;

    snapshot.docs.forEach((doc, index) => {
      if (index < pageSize) {
        users.push(transformFirestoreUser(doc));
      }

      if (index === snapshot.docs.length - 1) {
        lastDocument = doc;
      }
    });

    return {
      users,
      lastDoc: lastDocument
    };
  } catch (error) {
    console.error('Error fetching paginated users:', error);
    throw error;
  }
};
