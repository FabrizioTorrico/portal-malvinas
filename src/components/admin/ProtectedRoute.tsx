import { useAuth } from '@/hooks/useAuth'
import { type FC, type ReactNode } from 'react'

import LoginForm from './LoginForm'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  loadingComponent?: ReactNode
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  fallback,
  loadingComponent
}) => {
  const { user, isLoading, isAuthenticated, error } = useAuth()

  // Loading state
  if (isLoading) {
    return (
      loadingComponent || (
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-gray-600'>Verificando autenticación...</p>
          </div>
        </div>
      )
    )
  }

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      fallback || (
        <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
          <LoginForm />
        </div>
      )
    )
  }

  // Authenticated but not admin
  if (user && !user.isAdmin) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-md text-center'>
          <div className='rounded-lg bg-white p-8 shadow-lg'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
              <svg className='h-8 w-8 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <h2 className='mb-4 text-2xl font-bold text-gray-900'>Acceso Denegado</h2>
            <p className='mb-6 text-gray-600'>
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className='rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700'
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated and admin - show protected content
  return <>{children}</>
}

/**
 * Hook for components that need admin authentication
 */
export const useRequireAdmin = () => {
  const auth = useAuth()

  if (!auth.isLoading && (!auth.isAuthenticated || !auth.user?.isAdmin)) {
    throw new Error('Admin authentication required')
  }

  return auth
}

/**
 * Admin layout wrapper with navigation
 */
interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

export const AdminLayout: FC<AdminLayoutProps> = ({
  children,
  title = 'Panel de Administración'
}) => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className='bg-muted min-h-screen'>
      {/* Header */}
      <header className='bg-muted border-b shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            {/* Title */}
            <div className='flex items-center'>
              <h1 className='text-xl font-semibold text-gray-900'>{title}</h1>
            </div>

            {/* User Menu */}
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-700'>
                Bienvenido, <span className='font-medium'>{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className='rounded-md px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700'
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>{children}</main>
    </div>
  )
}

export default ProtectedRoute
