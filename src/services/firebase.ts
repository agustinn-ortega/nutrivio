import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyCkC8gIbWt7SQtbypw94VuiAjmC4paKZkM',
  authDomain: 'nutrivio-66348.firebaseapp.com',
  projectId: 'nutrivio-66348',
  storageBucket: 'nutrivio-66348.firebasestorage.app',
  messagingSenderId: '984324688564',
  appId: '1:984324688564:web:d7efb7c5f8c01b364a25e1',
};

const app = initializeApp(firebaseConfig);

// On native, use AsyncStorage for auth persistence; on web, use default
let auth: ReturnType<typeof getAuth>;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // For React Native, we need to use a compatible persistence
  try {
    const { getReactNativePersistence } = require('firebase/auth');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }
}

export { auth };
export const db = getFirestore(app);
export default app;
