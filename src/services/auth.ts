import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return { user };
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: fullName });
  return { user };
}

export async function signInWithGoogle() {
  await signInWithRedirect(auth, googleProvider);
}

// Call this on app startup to handle the redirect result
export async function handleGoogleRedirect() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    console.warn('[auth] redirect result error:', err);
    return null;
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function getSession() {
  return auth.currentUser;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const unsubscribe = onAuthStateChanged(auth, callback);
  return { data: { subscription: { unsubscribe } } };
}
