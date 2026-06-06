import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type AuthError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { AppUser } from '@/types';

export async function registerUser(email: string, password: string, displayName: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await setDoc(doc(db, 'users', user.uid), {
    email,
    displayName,
    photoURL: null,
    role: 'user',
    isActive: true,
    createdAt: serverTimestamp(),
    theme: 'crimson-noir',
  });
  return user;
}

export async function loginUser(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', user.uid), { lastLoginAt: serverTimestamp() }, { merge: true });
  return user;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email ?? '',
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    role: data.role ?? 'user',
    permissions: data.permissions,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    lastLoginAt: data.lastLoginAt?.toMillis?.() ?? undefined,
    theme: data.theme ?? 'crimson-noir',
  };
}

export function authErrorMessage(err: AuthError): string {
  switch (err.code) {
    case 'auth/email-already-in-use':    return 'This email is already registered.';
    case 'auth/invalid-email':           return 'Invalid email address.';
    case 'auth/weak-password':           return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':      return 'Invalid email or password.';
    case 'auth/too-many-requests':       return 'Too many attempts. Try again later.';
    default:                             return 'Something went wrong. Please try again.';
  }
}
