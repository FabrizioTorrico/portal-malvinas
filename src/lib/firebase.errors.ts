import type { FirebaseError } from '../types/firebase.types'

/**
 * Spanish error messages for Firebase operations
 */
export const ERROR_MESSAGES = {
  // Network and connection errors
  'network-error': 'Error de conexión. Verifica tu internet e intenta nuevamente.',
  unavailable: 'Servicio temporalmente no disponible. Intenta más tarde.',
  timeout: 'La operación tardó demasiado. Intenta nuevamente.',

  // Authentication errors
  unauthenticated: 'Debes iniciar sesión para continuar.',
  'permission-denied': 'No tienes permisos para realizar esta acción.',
  'user-not-found': 'Usuario no encontrado.',
  'wrong-password': 'Contraseña incorrecta.',
  'invalid-email': 'Dirección de email inválida.',

  // Storage errors
  'storage/quota-exceeded': 'Se ha excedido la cuota de almacenamiento.',
  'storage/unauthenticated': 'Debes iniciar sesión para subir archivos.',
  'storage/unauthorized': 'No tienes permisos para subir archivos.',
  'storage/retry-limit-exceeded': 'Demasiados intentos. Intenta más tarde.',
  'storage/invalid-format': 'Formato de archivo no válido.',
  'storage/object-not-found': 'Archivo no encontrado.',

  // Firestore errors
  'firestore/permission-denied': 'No tienes permisos para acceder a estos datos.',
  'firestore/unavailable': 'Base de datos temporalmente no disponible.',
  'firestore/deadline-exceeded': 'La operación tardó demasiado tiempo.',
  'firestore/resource-exhausted': 'Se han agotado los recursos disponibles.',

  // File validation errors
  'file-too-large': 'El archivo es demasiado grande. Máximo {maxSize}MB.',
  'invalid-file-type': 'Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y WebP.',
  'file-required': 'Este archivo es obligatorio.',
  'file-corrupted': 'El archivo está dañado o corrupto.',

  // Form validation errors
  'required-field': 'Este campo es obligatorio.',
  'invalid-phone': 'Número de teléfono inválido. Debe tener entre 10 y 15 dígitos.',
  'content-too-short': 'El contenido debe tener al menos {minLength} caracteres.',
  'content-too-long': 'El contenido no puede exceder {maxLength} caracteres.',
  'name-too-short': 'El nombre debe tener al menos {minLength} caracteres.',
  'name-too-long': 'El nombre no puede exceder {maxLength} caracteres.',
  'title-too-short': 'El título debe tener al menos {minLength} caracteres.',
  'title-too-long': 'El título no puede exceder {maxLength} caracteres.',
  'description-too-short': 'La descripción debe tener al menos {minLength} caracteres.',
  'description-too-long': 'La descripción no puede exceder {maxLength} caracteres.',

  // Success messages
  'relato-submitted': 'Tu relato ha sido enviado y está pendiente de aprobación.',
  'portal-memoria-submitted':
    'Tu entrada al portal de la memoria ha sido enviada y está pendiente de aprobación.',
  'submission-approved': 'La entrada ha sido aprobada exitosamente.',
  'submission-rejected': 'La entrada ha sido rechazada.',

  // Generic errors
  'unknown-error': 'Ha ocurrido un error inesperado. Intenta nuevamente.',
  maintenance: 'El sistema está en mantenimiento. Intenta más tarde.',
  'quota-exceeded': 'Se ha excedido la cuota diaria. Intenta mañana.'
} as const

/**
 * Error recovery strategies
 */
export interface ErrorRecoveryStrategy {
  retryable: boolean
  maxRetries: number
  backoffMs: number
  showRetryButton: boolean
  saveToLocalStorage: boolean
  showOfflineMessage: boolean
}

/**
 * Get error recovery strategy based on error type
 */
export const getErrorRecoveryStrategy = (errorCode: string): ErrorRecoveryStrategy => {
  const retryableErrors = [
    'unavailable',
    'timeout',
    'network-error',
    'storage/retry-limit-exceeded',
    'firestore/unavailable',
    'firestore/deadline-exceeded'
  ]

  const isRetryable = retryableErrors.includes(errorCode)

  return {
    retryable: isRetryable,
    maxRetries: isRetryable ? 3 : 0,
    backoffMs: 1000,
    showRetryButton: isRetryable,
    saveToLocalStorage: isRetryable,
    showOfflineMessage: errorCode === 'network-error'
  }
}

/**
 * Format error message with parameters
 */
export const formatErrorMessage = (
  messageTemplate: string,
  params: Record<string, any> = {}
): string => {
  let message = messageTemplate

  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, String(value))
  })

  return message
}

/**
 * Create a user-friendly Firebase error
 */
export const createFirebaseError = (
  code: string,
  originalError?: any,
  params: Record<string, any> = {}
): FirebaseError => {
  const messageTemplate =
    ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES['unknown-error']
  const userMessage = formatErrorMessage(messageTemplate, params)

  return {
    code,
    message: originalError?.message || userMessage,
    userMessage,
    originalError
  }
}

/**
 * Handle and log Firebase errors
 */
export const handleFirebaseError = (error: any, context?: string): FirebaseError => {
  // Log error for debugging
  console.error(`Firebase error${context ? ` in ${context}` : ''}:`, error)

  // Extract error code
  let errorCode = 'unknown-error'
  if (error?.code) {
    errorCode = error.code
  } else if (error?.name === 'NetworkError') {
    errorCode = 'network-error'
  } else if (error?.name === 'TimeoutError') {
    errorCode = 'timeout'
  }

  return createFirebaseError(errorCode, error)
}

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> => {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries) {
        break
      }

      // Check if error is retryable
      const strategy = getErrorRecoveryStrategy(error?.toString() || 'unknown-error')
      if (!strategy.retryable) {
        break
      }

      // Wait with exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw handleFirebaseError(lastError, 'retry')
}

/**
 * Check if user is offline
 */
export const isOffline = (): boolean => {
  return !navigator.onLine
}

/**
 * Wait for online connection
 */
export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve()
      return
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline)
      resolve()
    }

    window.addEventListener('online', handleOnline)
  })
}
