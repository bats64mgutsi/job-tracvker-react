import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyBjNCQTcuoidICEQvZVupX4zzKQNxdeGOM",
  authDomain: "job-tracking-app-4110f.firebaseapp.com",
  projectId: "job-tracking-app-4110f",
  storageBucket: "job-tracking-app-4110f.firebasestorage.app",
  messagingSenderId: "825184122958",
  appId: "1:825184122958:web:86943a69f04216ad6ceb1f"
});

export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const firestore = getFirestore(firebaseApp);
