import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import React, { useEffect, useState, type FC } from 'react'

import { getFirebaseAuth } from '../../lib/firebase.config'

interface AdminAuthProps {
  onAuthChange: (user: User | null) => void
  children: React.ReactNode
}

interface LoginFormData {
  email: string
  password: string
}

const AdminAuth: FC<AdminAuthProps> = ({ onAuthChange, children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginData, setLoginData] = useState<LoginFormData>({ email: '', password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const auth = getFirebaseAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setIsLoading(false)
      onAuthChange(user)
    })

    return () => unsubscribe()
  }, [auth, onAuthChange])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError(null)

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      // User state will be updated by onAuthStateChanged
    } catch (error: any) {
      console.error('Login error:', error)

      let errorMessage = 'Error al iniciar sesión. Intenta nuevamente.'

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado.'
          break
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Dirección de email inválida.'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet.'
          break
      }

      setLoginError(errorMessage)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setLoginData({ email: '', password: '' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateLoginField = (field: keyof LoginFormData, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }))
    if (loginError) {
      setLoginError(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='flex min-h-[80vh] items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Login form
  if (!user) {
    return (
      <div className='flex min-h-[80vh] items-center justify-center'>
        <div className='w-full max-w-md space-y-8'>
          <div>
            <h2 className='mt-6 text-center text-3xl font-extrabold'>Panel de Administración</h2>
            <p className='mt-2 text-center text-sm'>
              Inicia sesión para acceder al panel de administración
            </p>
          </div>

          <form className='mt-8 space-y-6' onSubmit={handleLogin}>
            {loginError && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                <div className='flex'>
                  <svg
                    className='mr-2 mt-0.5 h-5 w-5 text-red-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <div>
                    <h3 className='text-sm font-medium text-red-800'>Error de autenticación</h3>
                    <p className='mt-1 text-sm text-red-700'>{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className='space-y-4'>
              <div>
                <label htmlFor='email' className='text-foreground mb-2 block font-bold'>
                  Email <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='email'
                  name='email'
                  value={loginData.email}
                  onChange={(e) => updateLoginField('email', e.target.value)}
                  className={`placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm`}
                  placeholder='admin@example.com'
                  required
                  disabled={isLoggingIn}
                />
              </div>

              <div>
                <label htmlFor='email' className='text-foreground mb-2 block font-bold'>
                  Contraseña <span className='text-red-500'>*</span>
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  placeholder='••••••••'
                  value={loginData.password}
                  onChange={(e) => updateLoginField('password', e.target.value)}
                  className={`placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm`}
                  required
                  disabled={isLoggingIn}
                />
              </div>
            </div>

            <div className='flex items-center justify-center'>
              <button
                type='submit'
                disabled={isLoggingIn || !loginData.email || !loginData.password}
                className={`mt-4 scale-110 border-2 px-6 py-3 font-medium transition-all ${
                  isLoggingIn
                    ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-500'
                    : 'bg-secondary border-primary text-primary hover:bg-primary hover:text-secondary'
                } `}
              >
                {isLoggingIn ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Authenticated - show admin panel with logout option
  return (
    <div className='min-h-screen'>
      {/* Header with logout */}
      <header className='bg-muted border-b shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div>
              <p className='text-foreground text-sm'>Administrador: {user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className='text-foreground hover:text-primary inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors'
            >
              <svg className='mr-2 h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z'
                  clipRule='evenodd'
                />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}

export default AdminAuth
