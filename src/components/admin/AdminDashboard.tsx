import { firebaseService } from '@/lib/firebase.service'
import type { DocumentData } from 'firebase/firestore'
import { useEffect, useState, type FC } from 'react'

import { AdminLayout, ProtectedRoute } from './ProtectedRoute'

interface DashboardStats {
  pendingRelatos: number
  pendingPortalMemoria: number
  approvedRelatos: number
  approvedPortalMemoria: number
}

const AdminDashboard: FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    pendingRelatos: 0,
    pendingPortalMemoria: 0,
    approvedRelatos: 0,
    approvedPortalMemoria: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pendingRelatos, setPendingRelatos] = useState<DocumentData[]>([])
  const [pendingPortalMemoria, setPendingPortalMemoria] = useState<DocumentData[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load pending submissions
      const [relatosData, portalMemoriaData] = await Promise.all([
        firebaseService.getPendingSubmissions('relatos'),
        firebaseService.getPendingSubmissions('portal-memoria')
      ])

      setPendingRelatos(relatosData)
      setPendingPortalMemoria(portalMemoriaData)

      // Load approved content for stats
      const [approvedRelatos, approvedPortalMemoria] = await Promise.all([
        firebaseService.getApprovedRelatos(0), // Get all
        firebaseService.getApprovedPortalMemoria(0) // Get all
      ])

      setStats({
        pendingRelatos: relatosData.length,
        pendingPortalMemoria: portalMemoriaData.length,
        approvedRelatos: approvedRelatos.length,
        approvedPortalMemoria: approvedPortalMemoria.length
      })
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      setError(error.message || 'Error al cargar los datos del panel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string, type: 'relatos' | 'portal-memoria') => {
    try {
      await firebaseService.approveSubmission(id, type, 'admin') // TODO: Use actual admin ID
      await loadDashboardData() // Refresh data
    } catch (error: any) {
      console.error('Error approving submission:', error)
      setError(error.message || 'Error al aprobar la submisión')
    }
  }

  const handleReject = async (id: string, type: 'relatos' | 'portal-memoria', notes: string) => {
    try {
      await firebaseService.rejectSubmission(id, type, 'admin', notes) // TODO: Use actual admin ID
      await loadDashboardData() // Refresh data
    } catch (error: any) {
      console.error('Error rejecting submission:', error)
      setError(error.message || 'Error al rechazar la submisión')
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className='flex h-64 items-center justify-center'>
            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AdminLayout title='Panel de Administración - Portal Malvinas'>
        <div className='space-y-8'>
          {/* Error Message */}
          {error && (
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
                  <h3 className='text-sm font-medium text-red-800'>Error</h3>
                  <p className='mt-1 text-sm text-red-700'>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100'>
                    <svg
                      className='h-5 w-5 text-yellow-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-500'>Relatos Pendientes</p>
                  <p className='text-2xl font-semibold text-gray-900'>{stats.pendingRelatos}</p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100'>
                    <svg
                      className='h-5 w-5 text-yellow-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-500'>Portal Memoria Pendientes</p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {stats.pendingPortalMemoria}
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                    <svg className='h-5 w-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-500'>Relatos Aprobados</p>
                  <p className='text-2xl font-semibold text-gray-900'>{stats.approvedRelatos}</p>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                    <svg className='h-5 w-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-500'>Portal Memoria Aprobados</p>
                  <p className='text-2xl font-semibold text-gray-900'>
                    {stats.approvedPortalMemoria}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Submissions */}
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            {/* Pending Relatos */}
            <div className='rounded-lg bg-white shadow'>
              <div className='border-b border-gray-200 px-6 py-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Relatos Pendientes ({stats.pendingRelatos})
                </h3>
              </div>
              <div className='p-6'>
                {pendingRelatos.length === 0 ? (
                  <p className='py-4 text-center text-gray-500'>No hay relatos pendientes</p>
                ) : (
                  <div className='space-y-4'>
                    {pendingRelatos.slice(0, 5).map((relato) => (
                      <div key={relato.id} className='rounded-lg border p-4'>
                        <div className='mb-2 flex items-start justify-between'>
                          <h4 className='font-medium text-gray-900'>{relato.title}</h4>
                          <span className='text-xs text-gray-500'>
                            {relato.created_at?.toDate?.()?.toLocaleDateString('es-AR') ||
                              'Fecha no disponible'}
                          </span>
                        </div>
                        <p className='mb-2 text-sm text-gray-600'>
                          Por: {relato.name} {relato.surname}
                        </p>
                        <p className='mb-3 line-clamp-2 text-sm text-gray-500'>
                          {relato.content?.substring(0, 100)}...
                        </p>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => handleApprove(relato.id, 'relatos')}
                            className='rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700'
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() =>
                              handleReject(relato.id, 'relatos', 'Rechazado por el administrador')
                            }
                            className='rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700'
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Portal Memoria */}
            <div className='rounded-lg bg-white shadow'>
              <div className='border-b border-gray-200 px-6 py-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Portal Memoria Pendientes ({stats.pendingPortalMemoria})
                </h3>
              </div>
              <div className='p-6'>
                {pendingPortalMemoria.length === 0 ? (
                  <p className='py-4 text-center text-gray-500'>
                    No hay entradas de portal memoria pendientes
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {pendingPortalMemoria.slice(0, 5).map((memoria) => (
                      <div key={memoria.id} className='rounded-lg border p-4'>
                        <div className='mb-2 flex items-start justify-between'>
                          <h4 className='font-medium text-gray-900'>
                            {memoria.name} {memoria.surname}
                          </h4>
                          <span className='text-xs text-gray-500'>
                            {memoria.created_at?.toDate?.()?.toLocaleDateString('es-AR') ||
                              'Fecha no disponible'}
                          </span>
                        </div>
                        <p className='mb-3 line-clamp-2 text-sm text-gray-500'>
                          {memoria.description?.substring(0, 100)}...
                        </p>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => handleApprove(memoria.id, 'portal-memoria')}
                            className='rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700'
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() =>
                              handleReject(
                                memoria.id,
                                'portal-memoria',
                                'Rechazado por el administrador'
                              )
                            }
                            className='rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700'
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-center'>
            <button
              onClick={loadDashboardData}
              className='rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700'
            >
              Actualizar Datos
            </button>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}

export default AdminDashboard
