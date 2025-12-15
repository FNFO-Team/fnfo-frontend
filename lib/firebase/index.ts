import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

// Initialize Firebase app only if it doesn't already exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Export the app instance as well
export { app };