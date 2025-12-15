import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  getIdToken,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { auth } from './index';

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<{ user: FirebaseUser; idToken: string }> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await getIdToken(result.user);
  return { user: result.user, idToken };
};

/**
 * Create a new user with email and password
 */
export const signUp = async (email: string, password: string, displayName?: string): Promise<{ user: FirebaseUser; idToken: string }> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name if provided
  if (displayName) {
    await updateProfile(result.user, {
      displayName
    });
  }
  
  const idToken = await getIdToken(result.user);
  return { user: result.user, idToken };
};

/**
 * Sign in anonymously (for testing purposes)
 */
export const signInAnonymouslyAsync = async (): Promise<{ user: FirebaseUser; idToken: string }> => {
  const result = await signInAnonymously(auth);
  const idToken = await getIdToken(result.user);
  return { user: result.user, idToken };
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

/**
 * Get the current user's ID token
 */
export const getCurrentUserToken = async (): Promise<string | null> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return await getIdToken(currentUser);
  }
  return null;
};

/**
 * Get the current user object
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};