import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../services/firebase';
import { getAuth } from 'firebase/auth';

export async function logErrorToFirestore(error: any, context: Record<string, any> = {}) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    await addDoc(collection(firestore, 'errors'), {
      message: error?.message || String(error),
      code: error?.code || null,
      stack: error?.stack || null,
      userId: user ? user.uid : null,
      email: user ? user.email : null,
      context,
      timestamp: Timestamp.now()
    });
  } catch (err) {
    // Optionally log to console if Firestore logging fails
    console.error('Failed to log error to Firestore:', err);
  }
}
