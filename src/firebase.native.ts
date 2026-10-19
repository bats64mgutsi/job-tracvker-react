import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from './environment/environment';

export const firebaseApp = getApps().length === 0 ? initializeApp(environment) : getApp();

export const firebaseAuth: Auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const firestore: Firestore = getFirestore(firebaseApp);
