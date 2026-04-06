import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

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
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  return { user };
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
