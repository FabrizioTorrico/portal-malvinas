import { connectFirestoreEmulator } from 'firebase/firestore'
import { connectStorageEmulator } from 'firebase/storage'
import { connectAuthEmulator } from 'firebase/auth'
import type { FirebaseServices } from './firebase.config'

// Check if we're in development mode and emulators should be used
const isDevelopment = import.meta.env.DEV
const useEmulators = isDevelopment && import.meta.env.PUBLIC_USE_FIREBASE_EMULATORS === 'true'

// Emulator configuration
const EMULATOR_CONFIG = {
  firestore: {
    host: import.meta.env.FIREBASE_EMULATOR_FIRESTORE_HOST || 'localhost',
    port: parseInt(import.meta.env.FIREBASE_EMULATOR_FIRESTORE_PORT || '8080')
  },
  storage: {
    host: import.meta.env.FIREBASE_EMULATOR_STORAGE_HOST || 'localhost',
    port: parseInt(import.meta.env.FIREBASE_EMULATOR_STORAGE_PORT || '9199')
  },
  auth: {
    host: import.meta.env.FIREBASE_EMULATOR_AUTH_HOST || 'localhost',
    port: parseInt(import.meta.env.FIREBASE_EMULATOR_AUTH_PORT || '9099')
  }
}

// Track if emulators have been connected to avoid multiple connections
let emulatorsConnected = false

/**
 * Connect Firebase services to emulators if in development mode
 */
export const connectToEmulators = (services: FirebaseServices): void => {
  if (!useEmulators || emulatorsConnected) {
    return
  }

  try {
    // Connect Firestore emulator
    connectFirestoreEmulator(
      services.firestore,
      EMULATOR_CONFIG.firestore.host,
      EMULATOR_CONFIG.firestore.port
    )

    // Connect Storage emulator
    connectStorageEmulator(
      services.storage,
      EMULATOR_CONFIG.storage.host,
      EMULATOR_CONFIG.storage.port
    )

    // Connect Auth emulator
    connectAuthEmulator(
      services.auth,
      `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`,
      { disableWarnings: true }
    )

    emulatorsConnected = true
    console.log('🔥 Connected to Firebase emulators')
  } catch (error) {
    console.warn('Failed to connect to Firebase emulators:', error)
  }
}

/**
 * Check if emulators are being used
 */
export const isUsingEmulators = (): boolean => {
  return useEmulators
}

/**
 * Get emulator URLs for debugging
 */
export const getEmulatorUrls = () => {
  if (!useEmulators) {
    return null
  }

  return {
    ui: `http://localhost:4000`,
    firestore: `http://${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}`,
    storage: `http://${EMULATOR_CONFIG.storage.host}:${EMULATOR_CONFIG.storage.port}`,
    auth: `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`
  }
}