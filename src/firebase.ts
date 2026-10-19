import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  getAuth,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBjNCQTcuoidICEQvZVupX4zzKQNxdeGOM",
  authDomain: "job-tracking-app-4110f.firebaseapp.com",
  projectId: "job-tracking-app-4110f",
  storageBucket: "job-tracking-app-4110f.firebasestorage.app",
  messagingSenderId: "825184122958",
  appId: "1:825184122958:web:86943a69f04216ad6ceb1f",
  measurementId: "G-BPGH1269GV"
};

export const firebaseApp: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseAuth: Auth = (() => {
  if (Platform.OS === 'web') {
    try {
      return initializeAuth(firebaseApp, { persistence: browserLocalPersistence });
    } catch {
      return getAuth(firebaseApp);
    }
  }

  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
})();

export const firestore: Firestore = getFirestore(firebaseApp);
