import { FirebaseApp, getApps, initializeApp, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from './environment/environment';

export const firebaseApp: FirebaseApp = getApps().length === 0 ? initializeApp(environment) : getApp();
export const firebaseAuth: Auth = getAuth(firebaseApp);
export const firestore: Firestore = getFirestore(firebaseApp);
