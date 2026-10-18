import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from './environment/environment';

export const firebaseApp = getApps().length === 0 ? initializeApp(environment) : getApp();

export const firebaseAuth: Auth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: browserLocalPersistence,
    });
  } catch {
    return getAuth(firebaseApp);
  }
})();

export const firestore: Firestore = getFirestore(firebaseApp);
