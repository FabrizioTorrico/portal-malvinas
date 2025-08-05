import { getFirebaseAuth } from '@/lib/firebase.config'
import { createFirebaseError } from '@/lib/firebase.errors'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { useCallback, useEffect, useState } from 'react'

export interface AuthUser {
  uid: string
  email: string | null
  isAdmin: boolean
  displayName: string | null
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

/**
 * Authentication hook for admin users
 */
export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  })

  const auth = getFirebaseAuth()

  // Check if user is admin based on custom claims
  const checkAdminStatus = useCallback(async (user: User): Promise<boolean> => {
    try {
      const idTokenResult = await user.getIdTokenResult()
      return Boolean(idTokenResult.claims.admin)
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }, [])

  // Convert Firebase user to AuthUser
  const convertToAuthUser = useCallback(
    async (user: User): Promise<AuthUser> => {
      const isAdmin = await checkAdminStatus(user)

      return {
        uid: user.uid,
        email: user.email,
        isAdmin,
        displayName: user.displayName
      }
    },
    [checkAdminStatus]
  )

  // Sign in function
  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Check if user is admin
        const isAdmin = await checkAdminStatus(user)

        if (!isAdmin) {
          await signOut(auth)
          throw createFirebaseError('permission-denied', null, {
            message: 'No tienes permisos de administrador'
          })
        }

        // User will be set by onAuthStateChanged listener
      } catch (error: any) {
        console.error('Sign in error:', error)

        let errorMessage = 'Error al iniciar sesión'

        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Usuario no encontrado'
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Contraseña incorrecta'
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido'
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Demasiados intentos. Intenta más tarde'
        } else if (error.message) {
          errorMessage = error.message
        }

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))

        throw error
      }
    },
    [auth, checkAdminStatus]
  )

  // Sign out function
  const signOutUser = useCallback(async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))
      await signOut(auth)
      // User will be cleared by onAuthStateChanged listener
    } catch (error: any) {
      console.error('Sign out error:', error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Error al cerrar sesión'
      }))
      throw error
    }
  }, [auth])

  // Clear error function
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }))
  }, [])

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const authUser = await convertToAuthUser(firebaseUser)

          // Only allow admin users
          if (!authUser.isAdmin) {
            await signOut(auth)
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: 'No tienes permisos de administrador'
            })
            return
          }

          setAuthState({
            user: authUser,
            isLoading: false,
            isAuthenticated: true,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: 'Error al verificar autenticación'
        })
      }
    })

    return unsubscribe
  }, [auth, convertToAuthUser])

  return {
    ...authState,
    signIn,
    signOut: signOutUser,
    clearError
  }
}

/**
 * Hook to check if current user is admin (for route protection)
 */
export const useRequireAuth = () => {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirect to login or show unauthorized message
      console.warn('User not authenticated')
    }
  }, [auth.isLoading, auth.isAuthenticated])

  return auth
}

/**
 * Higher-order component for protecting admin routes
 */
export const withAuth = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  return (props: P) => {
    const auth = useAuth()

    if (auth.isLoading) {
      return (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      )
    }

    if (!auth.isAuthenticated) {
      return (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='text-center'>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>Acceso no autorizado</h2>
            <p className='text-gray-600'>
              Necesitas permisos de administrador para acceder a esta página.
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
