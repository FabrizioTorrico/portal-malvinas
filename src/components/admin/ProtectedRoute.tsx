import { type FC, type ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      )
    )
  }

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <LoginForm />
        </div>
      )
    )
  }

  // Authenticated but not admin
  if (user && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-6">
              No tienes permisos de administrador para acceder a esta página.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Bienvenido, <span className="font-medium">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default ProtectedRoute