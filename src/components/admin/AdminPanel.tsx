import { useEffect, useState, type FC } from 'react'

import { firebaseService } from '../../lib/firebase.service'
import type { PortalMemoriaDocument, RelatoDocument } from '../../types/firebase.types'

interface PendingSubmission {
  id: string
  type: 'relatos' | 'portal-memoria'
  data: RelatoDocument | PortalMemoriaDocument
}

interface AdminPanelProps {
  adminId: string
}

const AdminPanel: FC<AdminPanelProps> = ({ adminId }) => {
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<PendingSubmission | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'relatos' | 'portal-memoria'>('relatos')

  // Load pending submissions
  useEffect(() => {
    loadPendingSubmissions()
  }, [])

  const loadPendingSubmissions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [pendingRelatos, pendingPortalMemoria] = await Promise.all([
        firebaseService.getPendingSubmissions('relatos'),
        firebaseService.getPendingSubmissions('portal-memoria')
      ])

      const submissions: PendingSubmission[] = [
        ...pendingRelatos.map((data) => ({
          id: data.id,
          type: 'relatos' as const,
          data: data as RelatoDocument
        })),
        ...pendingPortalMemoria.map((data) => ({
          id: data.id,
          type: 'portal-memoria' as const,
          data: data as PortalMemoriaDocument
        }))
      ]

      // Sort by creation date, newest first
      submissions.sort((a, b) => {
        const aDate = a.data.created_at?.toDate?.() || new Date(0)
        const bDate = b.data.created_at?.toDate?.() || new Date(0)
        return bDate.getTime() - aDate.getTime()
      })

      setPendingSubmissions(submissions)
    } catch (error: any) {
      console.error('Error loading pending submissions:', error)
      setError('Error al cargar las solicitudes pendientes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (submission: PendingSubmission) => {
    try {
      setActionLoading(submission.id)

      await firebaseService.approveSubmission(submission.id, submission.type, adminId)

      // Remove from pending list
      setPendingSubmissions((prev) => prev.filter((s) => s.id !== submission.id))
      setSelectedSubmission(null)

      // Show success message (you could add a toast notification here)
      console.log('Submission approved successfully')
    } catch (error: any) {
      console.error('Error approving submission:', error)
      setError('Error al aprobar la solicitud')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (submission: PendingSubmission) => {
    if (!rejectionNotes.trim()) {
      setError('Por favor, proporciona una razón para el rechazo')
      return
    }

    try {
      setActionLoading(submission.id)

      await firebaseService.rejectSubmission(
        submission.id,
        submission.type,
        adminId,
        rejectionNotes
      )

      // Remove from pending list
      setPendingSubmissions((prev) => prev.filter((s) => s.id !== submission.id))
      setSelectedSubmission(null)
      setRejectionNotes('')

      // Show success message
      console.log('Submission rejected successfully')
    } catch (error: any) {
      console.error('Error rejecting submission:', error)
      setError('Error al rechazar la solicitud')
    } finally {
      setActionLoading(null)
    }
  }

  const openSubmissionModal = (submission: PendingSubmission) => {
    setSelectedSubmission(submission)
    setRejectionNotes('')
    setError(null)
    document.body.style.overflow = 'hidden'
  }

  const closeSubmissionModal = () => {
    setSelectedSubmission(null)
    setRejectionNotes('')
    setError(null)
    document.body.style.overflow = 'unset'
  }

  const formatDate = (timestamp: any): string => {
    const date = timestamp?.toDate?.() || new Date()
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredSubmissions = pendingSubmissions.filter((s) => s.type === activeTab)

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-lg text-gray-600'>Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-7xl p-6'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>Panel de Administración</h1>
        <p>Gestiona las solicitudes pendientes de aprobación</p>
      </div>

      {error && (
        <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
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

      {/* Tabs */}
      <div className='mb-6'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('relatos')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'relatos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Relatos ({pendingSubmissions.filter((s) => s.type === 'relatos').length})
            </button>
            <button
              onClick={() => setActiveTab('portal-memoria')}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === 'portal-memoria'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Portal Memoria ({pendingSubmissions.filter((s) => s.type === 'portal-memoria').length}
              )
            </button>
          </nav>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className='py-12 text-center'>
          <svg
            className='mx-auto mb-4 h-16 w-16 text-gray-400'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z'
              clipRule='evenodd'
            />
          </svg>
          <h3 className='mb-2 text-lg font-medium text-gray-900'>No hay solicitudes pendientes</h3>
          <p className='text-gray-500'>
            No hay {activeTab === 'relatos' ? 'relatos' : 'entradas del portal de memoria'}{' '}
            pendientes de revisión.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className='border-primary bg-muted cursor-pointer rounded-lg border border-2 shadow-sm transition-shadow hover:shadow-md'
              onClick={() => openSubmissionModal(submission)}
            >
              <div className='p-6'>
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='mb-1 text-lg font-semibold'>
                      {submission.type === 'relatos'
                        ? (submission.data as RelatoDocument).title
                        : `${submission.data.name} ${submission.data.surname}`}
                    </h3>
                    <p className='text-sm'>
                      Por {submission.data.name} {submission.data.surname}
                    </p>
                  </div>
                  <span className='inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800'>
                    Pendiente
                  </span>
                </div>

                <div className='mb-4'>
                  <p className='bg-background text-foreground line-clamp-3 rounded-lg p-4 text-sm'>
                    {submission.type === 'relatos'
                      ? (submission.data as RelatoDocument).content
                      : (submission.data as PortalMemoriaDocument).description}
                  </p>
                </div>

                <div className='flex items-center justify-between text-xs'>
                  <span>Enviado: {formatDate(submission.data.created_at)}</span>
                  <span className='capitalize'>{submission.type.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='bg-muted border-primary max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border-2'>
            {/* Modal Header */}
            <div className='flex items-center justify-between border-b p-6'>
              <h2 className='text-2xl font-bold'>
                Revisar {selectedSubmission.type === 'relatos' ? 'Relato' : 'Portal Memoria'}
              </h2>
              <button onClick={closeSubmissionModal} className=''>
                <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className='p-6'>
              <div className='grid grid-cols-1 gap-6'>
                {/* Submission Details */}
                <div className='space-y-4'>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold'>Información Personal</h3>
                    <div className='space-y-2'>
                      <p>
                        <strong>Nombre:</strong> {selectedSubmission.data.name}
                      </p>
                      <p>
                        <strong>Apellido:</strong> {selectedSubmission.data.surname}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {selectedSubmission.data.phone}
                      </p>
                      <p>
                        <strong>Enviado:</strong> {formatDate(selectedSubmission.data.created_at)}
                      </p>
                    </div>
                  </div>

                  {selectedSubmission.type === 'relatos' ? (
                    <div>
                      <h3 className='mb-2 text-lg font-semibold text-gray-900'>Relato</h3>
                      <div className='space-y-2'>
                        <p>
                          <strong>Título:</strong>
                          {(selectedSubmission.data as RelatoDocument).title}
                        </p>
                        <div>
                          <strong>Contenido:</strong>
                          <div className='bg-background mt-2 max-h-60 overflow-y-auto rounded-lg p-3'>
                            <p className='whitespace-pre-wrap text-sm'>
                              {(selectedSubmission.data as RelatoDocument).content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className='mb-2 text-lg font-semibold'>Portal Memoria</h3>
                      <div>
                        <strong>Descripción:</strong>
                        <div className='bg-background text-foreground mt-2 rounded-lg p-4 text-sm'>
                          <p className='whitespace-pre-wrap text-sm'>
                            {(selectedSubmission.data as PortalMemoriaDocument).description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className='space-y-4'>
                  <div>
                    <h3 className='mb-2 text-lg font-semibold text-gray-900'>Imagen DNI</h3>
                    <img
                      src={selectedSubmission.data.dni_image_url}
                      alt='DNI'
                      className='h-full w-full rounded-lg border object-cover'
                    />
                  </div>

                  <div>
                    <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                      {selectedSubmission.type === 'relatos' ? 'Imagen Banner' : 'Fotografía'}
                    </h3>
                    <img
                      src={
                        selectedSubmission.type === 'relatos'
                          ? (selectedSubmission.data as RelatoDocument).banner_image_url
                          : (selectedSubmission.data as PortalMemoriaDocument).image_url
                      }
                      alt={selectedSubmission.type === 'relatos' ? 'Banner' : 'Fotografía'}
                      className='h-full w-full rounded-lg border object-cover'
                    />
                  </div>
                </div>
              </div>

              {/* Rejection Notes */}
              <div className='mt-6'>
                <label htmlFor='rejectionNotes' className='mb-2 block text-sm font-medium'>
                  Notas de rechazo (opcional)
                </label>
                <textarea
                  id='rejectionNotes'
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  rows={3}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Proporciona una razón si vas a rechazar esta solicitud...'
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className='rounded-b-lg border-t px-6 py-4'>
              <div className='flex justify-end space-x-3'>
                <button
                  onClick={closeSubmissionModal}
                  className='rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                  disabled={actionLoading === selectedSubmission.id}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleReject(selectedSubmission)}
                  disabled={actionLoading === selectedSubmission.id}
                  className='rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {actionLoading === selectedSubmission.id ? 'Rechazando...' : 'Rechazar'}
                </button>
                <button
                  onClick={() => handleApprove(selectedSubmission)}
                  disabled={actionLoading === selectedSubmission.id}
                  className='rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {actionLoading === selectedSubmission.id ? 'Aprobando...' : 'Aprobar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
