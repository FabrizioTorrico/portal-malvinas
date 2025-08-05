import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

// Firebase services interface
export interface FirebaseServices {
  app: FirebaseApp
  firestore: Firestore
  storage: FirebaseStorage
  auth: Auth
}

// Get Firebase configuration from environment variables
const getFirebaseConfig = (): FirebaseConfig => {
  const config = {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
  }

  // Validate that all required environment variables are present
  const missingVars = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`)
  }

  return config
}

// Initialize Firebase app and services
let firebaseServices: FirebaseServices | null = null

export const initializeFirebase = (): FirebaseServices => {
  if (firebaseServices) {
    return firebaseServices
  }

  try {
    const config = getFirebaseConfig()
    const app = initializeApp(config)

    const firestore = getFirestore(app)
    const storage = getStorage(app)
    const auth = getAuth(app)

    firebaseServices = {
      app,
      firestore,
      storage,
      auth
    }

    return firebaseServices
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    throw error
  }
}

// Export individual services for convenience
export const getFirebaseServices = (): FirebaseServices => {
  if (!firebaseServices) {
    return initializeFirebase()
  }
  return firebaseServices
}

// Export individual services
export const getFirebaseFirestore = (): Firestore => {
  return getFirebaseServices().firestore
}

export const getFirebaseStorage = (): FirebaseStorage => {
  return getFirebaseServices().storage
}

export const getFirebaseAuth = (): Auth => {
  return getFirebaseServices().auth
}
