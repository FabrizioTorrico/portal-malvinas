import { useEffect, useState } from 'react'

import { firebaseService } from '../../lib/firebase.service'
import type { PortalMemoriaDocument } from '../../types/firebase.types'

interface PortalMemoriaEntry {
  id: string
  name: string
  surname: string
  description: string
  image_url: string
  created_at: Date
}

export default function PortalMemoriaGallery() {
  const [entries, setEntries] = useState<PortalMemoriaEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<PortalMemoriaEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<PortalMemoriaEntry | null>(null)

  // Load approved portal memoria entries from Firebase
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const approvedEntries = await firebaseService.getApprovedPortalMemoria()

        const convertedEntries: PortalMemoriaEntry[] = approvedEntries.map(
          (entry: PortalMemoriaDocument) => ({
            id: entry.id,
            name: entry.name,
            surname: entry.surname,
            description: entry.description,
            image_url: entry.image_url,
            created_at: entry.created_at?.toDate?.() || new Date()
          })
        )

        // Sort by creation date, newest first
        convertedEntries.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

        setEntries(convertedEntries)
        setFilteredEntries(convertedEntries)
      } catch (error: any) {
        console.error('Error loading portal memoria entries:', error)
        setError('Error al cargar las entradas del portal de la memoria. Intenta nuevamente.')
      } finally {
        setIsLoading(false)
      }
    }

    loadEntries()
  }, [])

  // Filter entries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries)
    } else {
      const filtered = entries.filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
  }, [searchQuery, entries])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by useEffect
  }

  const openModal = (entry: PortalMemoriaEntry) => {
    setSelectedEntry(entry)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedEntry(null)
    document.body.style.overflow = 'unset'
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='flex flex-col gap-y-10'>
        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
          <div className='flex flex-col gap-2'>
            <h1 className='font-balboa text-4xl md:text-6xl'>Portal de la memoria</h1>
            <p className='m-auto'>
              Este apartado está destinado a presentar a las personas involucradas en la guerra de
              las Islas Malvinas
            </p>
          </div>
          <div className='relative w-full md:w-auto'>
            <input
              placeholder='Buscar por nombre'
              className='placeholder:text-muted-foreground border-muted-foreground p-y-2 p-x-4 w-full rounded-md border-2 pr-10'
              disabled
            />
          </div>
        </div>

        <div className='flex items-center justify-center py-20'>
          <div className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <p className='text-lg text-gray-600'>Cargando portal de la memoria...</p>
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
            <h1 className='font-balboa text-4xl md:text-6xl'>Portal de la memoria</h1>
            <p className='m-auto'>
              Este apartado está destinado a presentar a las personas involucradas en la guerra de
              las Islas Malvinas
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
            <h1 className='font-balboa text-4xl md:text-6xl'>Portal de la memoria</h1>
            <p className='m-auto'>
              Este apartado está destinado a presentar a las personas involucradas en la guerra de
              las Islas Malvinas
            </p>
          </div>

          <div className='flex w-full items-center gap-4 md:w-auto'>
            <form onSubmit={handleSearch} className='relative flex-1 md:w-auto' role='search'>
              <input
                placeholder='Buscar por nombre'
                className='placeholder:text-muted-foreground border-muted-foreground p-y-2 p-x-4 w-full rounded-md border-2 pr-10'
                aria-label='Búsqueda por nombre'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type='submit'
                className='bg-muted absolute end-3 top-1/2 flex -translate-y-1/2'
                aria-label='Buscar por nombre'
              >
                <svg
                  className='text-muted-foreground size-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </form>
            <a href='/portal-memoria/formulario' className='h-full'>
              <div className='bg-secondary text-primary flex h-full w-max items-center justify-center whitespace-nowrap rounded-xl p-1.5 px-3.5 font-medium'>
                Enviar Memoria
              </div>
            </a>
          </div>
        </div>

        {/* Empty state */}
        {entries.length === 0 ? (
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
                No hay entradas disponibles
              </h2>
              <p className='mb-4 text-gray-600'>
                Aún no se han publicado entradas en el portal de la memoria.
              </p>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
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
                No hay entradas que coincidan con "{searchQuery}". Intenta con otros términos.
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
          /* Gallery Grid */
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className='border-dark bg-muted group relative flex h-full cursor-pointer flex-col overflow-hidden border transition-shadow hover:shadow-lg'
                onClick={() => openModal(entry)}
              >
                <div className='relative aspect-square w-full overflow-hidden'>
                  <img
                    src={entry.image_url}
                    alt={`Fotografía de ${entry.name} ${entry.surname}`}
                    className='absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                    loading='lazy'
                  />
                </div>

                <div className='flex flex-grow flex-col p-6 text-center'>
                  <p className='text-foreground text-lg font-semibold'>
                    {entry.name} {entry.surname}
                  </p>
                  <p className='text-muted-foreground mt-1 line-clamp-3 h-12 flex-grow overflow-ellipsis'>
                    {entry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedEntry && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 p-4'
          onClick={closeModal}
        >
          <div
            className='border-primary bg-muted max-h-[90vh] w-full max-w-2xl overflow-y-auto border-2'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='flex items-center justify-between border-b p-6'>
              <h2 className='text-2xl font-bold'>
                {selectedEntry.name} {selectedEntry.surname}
              </h2>
              <button onClick={closeModal} className='bg-muted' aria-label='Cerrar modal'>
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
                <img
                  src={selectedEntry.image_url}
                  alt={`Fotografía de ${selectedEntry.name} ${selectedEntry.surname}`}
                  className='h-full w-full object-cover'
                />
              </div>

              <div className='space-y-4'>
                <div>
                  <h3 className='text-muted-foreground mb-2 text-lg font-semibold'>Descripción</h3>
                  <p className='text-muted-foreground leading-relaxed'>
                    {selectedEntry.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='bg-muted rounded-b-lg border-t px-6 py-4'>
              <div className='flex justify-between'>
                <p className='text-muted-foreground text-sm'>
                  Agregado el{' '}
                  {selectedEntry.created_at.toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
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
