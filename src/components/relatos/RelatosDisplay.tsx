import React, { useEffect, useState, type FC } from 'react'

import { firebaseService } from '../../lib/firebase.service'
import type { RelatoDocument } from '../../types/firebase.types'

interface RelatoEntry {
  id: string
  name: string
  surname: string
  title: string
  content: string
  banner_image_url: string
  created_at: Date
}

interface RelatosDisplayProps {
  limit?: number
  showPagination?: boolean
}

const RelatosDisplay: FC<RelatosDisplayProps> = ({ limit, showPagination = true }) => {
  const [relatos, setRelatos] = useState<RelatoEntry[]>([])
  const [filteredRelatos, setFilteredRelatos] = useState<RelatoEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRelato, setSelectedRelato] = useState<RelatoEntry | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Load approved relatos from Firebase
  useEffect(() => {
    const loadRelatos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const approvedRelatos = await firebaseService.getApprovedRelatos(limit)

        const convertedRelatos: RelatoEntry[] = approvedRelatos.map((relato: RelatoDocument) => ({
          id: relato.id,
          name: relato.name,
          surname: relato.surname,
          title: relato.title,
          content: relato.content,
          banner_image_url: relato.banner_image_url,
          created_at: relato.created_at?.toDate?.() || new Date()
        }))

        // Sort by creation date, newest first
        convertedRelatos.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

        setRelatos(convertedRelatos)
        setFilteredRelatos(convertedRelatos)
      } catch (error: any) {
        console.error('Error loading relatos:', error)
        setError('Error al cargar los relatos. Intenta nuevamente.')
      } finally {
        setIsLoading(false)
      }
    }

    loadRelatos()
  }, [limit])

  // Filter relatos based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRelatos(relatos)
    } else {
      const filtered = relatos.filter(
        (relato) =>
          relato.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          relato.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          relato.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          relato.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRelatos(filtered)
    }
    setCurrentPage(1) // Reset to first page when searching
  }, [searchQuery, relatos])

  // Pagination
  const totalPages = Math.ceil(filteredRelatos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRelatos = showPagination
    ? filteredRelatos.slice(startIndex, endIndex)
    : filteredRelatos

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by useEffect
  }

  const openModal = (relato: RelatoEntry) => {
    setSelectedRelato(relato)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedRelato(null)
    document.body.style.overflow = 'unset'
  }

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='flex flex-col gap-y-10'>
        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
          <div className='flex flex-col gap-2'>
            <h1 className='font-balboa text-4xl md:text-6xl'>Relatos</h1>
            <p className='m-auto'>
              Historias y testimonios de quienes vivieron la guerra de las Islas Malvinas
            </p>
          </div>
          <div className='relative w-full md:w-auto'>
            <input
              placeholder='Buscar relatos'
              className='placeholder:text-muted-foreground border-muted-foreground p-y-2 p-x-4 w-full rounded-md border-2 pr-10'
              disabled
            />
          </div>
        </div>

        <div className='flex items-center justify-center py-20'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-lg text-gray-600'>Cargando relatos...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='flex flex-col gap-y-10'>
        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
          <div className='flex flex-col gap-2'>
            <h1 className='font-balboa text-4xl md:text-6xl'>Relatos</h1>
            <p className='m-auto'>
              Historias y testimonios de quienes vivieron la guerra de las Islas Malvinas
            </p>
          </div>
        </div>

        <div className='flex items-center justify-center py-20'>
          <div className='max-w-md rounded-lg bg-red-50 p-8 text-center'>
            <svg
              className='mx-auto mb-4 h-16 w-16 text-red-500'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            <h2 className='mb-2 text-xl font-semibold text-red-800'>Error al cargar contenido</h2>
            <p className='mb-4 text-red-700'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-col gap-y-10'>
        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
          <div className='flex flex-col gap-2'>
            <h1 className='font-balboa text-4xl md:text-6xl'>Relatos</h1>
            <p className='m-auto'>
              Historias y testimonios de quienes vivieron la guerra de las Islas Malvinas
            </p>
          </div>

          <form onSubmit={handleSearch} className='relative w-full md:w-auto' role='search'>
            <input
              placeholder='Buscar relatos'
              className='placeholder:text-muted-foreground border-muted-foreground p-y-2 p-x-4 w-full rounded-md border-2 pr-10'
              aria-label='Búsqueda de relatos'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type='submit'
              className='bg-muted absolute end-3 top-1/2 flex -translate-y-1/2'
              aria-label='Buscar relatos'
            >
              <svg className='text-muted-foreground size-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Empty state */}
        {relatos.length === 0 ? (
          <div className='flex items-center justify-center py-20'>
            <div className='max-w-md rounded-lg bg-gray-50 p-8 text-center'>
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
              <h2 className='mb-2 text-xl font-semibold text-gray-800'>
                No hay relatos disponibles
              </h2>
              <p className='mb-4 text-gray-600'>Aún no se han publicado relatos.</p>
            </div>
          </div>
        ) : filteredRelatos.length === 0 ? (
          /* No search results */
          <div className='flex items-center justify-center py-20'>
            <div className='max-w-md rounded-lg bg-gray-50 p-8 text-center'>
              <svg
                className='mx-auto mb-4 h-16 w-16 text-gray-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                  clipRule='evenodd'
                />
              </svg>
              <h2 className='mb-2 text-xl font-semibold text-gray-800'>
                No se encontraron resultados
              </h2>
              <p className='mb-4 text-gray-600'>
                No hay relatos que coincidan con "{searchQuery}". Intenta con otros términos.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className='rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700'
              >
                Limpiar búsqueda
              </button>
            </div>
          </div>
        ) : (
          /* Relatos Grid */
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {currentRelatos.map((relato) => (
              <article
                key={relato.id}
                className='border-dark bg-muted group relative flex h-full cursor-pointer flex-col overflow-hidden border transition-shadow hover:shadow-lg'
                onClick={() => openModal(relato)}
              >
                <div className='relative aspect-video w-full overflow-hidden'>
                  <img
                    src={relato.banner_image_url}
                    alt={`Imagen del relato: ${relato.title}`}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                    loading='lazy'
                  />
                </div>

                <div className='flex flex-grow flex-col p-6'>
                  <h2 className='text-foreground mb-2 line-clamp-2 text-xl font-bold'>
                    {relato.title}
                  </h2>
                  <p className='text-muted-foreground mb-3 text-sm'>
                    Por {relato.name} {relato.surname}
                  </p>
                  <div className='text-foreground line-clamp-4 flex-grow text-sm leading-relaxed'>
                    {truncateContent(relato.content)}
                  </div>
                  <div className='mt-4 border-t border-gray-200 pt-4'>
                    <p className='text-xs text-gray-500'>
                      {relato.created_at.toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className='mt-8 flex items-center justify-center space-x-2'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  currentPage === page
                    ? 'border border-blue-600 bg-blue-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedRelato && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4'
          onClick={closeModal}
        >
          <div
            className='max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='relative'>
              <img
                src={selectedRelato.banner_image_url}
                alt={`Imagen del relato: ${selectedRelato.title}`}
                className='h-64 w-full object-cover md:h-80'
              />
              <button
                onClick={closeModal}
                className='absolute right-4 top-4 rounded-full bg-black bg-opacity-50 p-2 text-white transition-colors hover:bg-opacity-75'
                aria-label='Cerrar modal'
              >
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
              <div className='mb-6'>
                <h1 className='mb-2 text-3xl font-bold text-gray-900'>{selectedRelato.title}</h1>
                <p className='mb-4 text-lg text-gray-600'>
                  Por {selectedRelato.name} {selectedRelato.surname}
                </p>
                <p className='text-sm text-gray-500'>
                  Publicado el{' '}
                  {selectedRelato.created_at.toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className='prose prose-lg max-w-none'>
                <div
                  className='whitespace-pre-wrap leading-relaxed text-gray-700'
                  dangerouslySetInnerHTML={{
                    __html: selectedRelato.content.replace(/\n/g, '<br>')
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className='rounded-b-lg border-t bg-gray-50 px-6 py-4'>
              <div className='flex justify-end'>
                <button
                  onClick={closeModal}
                  className='rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700'
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RelatosDisplay
