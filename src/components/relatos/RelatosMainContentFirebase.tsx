import { useEffect, useState } from 'react'

import { firebaseService } from '../../lib/firebase.service'
import type { RelatoDocument } from '../../types/firebase.types'
import Carrousel from './Carrousel'

export type Story = {
  id: string
  title: string
  category: string
  categoryLabel: string
  description: string
  duration: string
  difficulty: string
  background: string
  featured?: boolean
  author: string
}

export default function RelatosMainContentFirebase() {
  const [stories, setStories] = useState<Story[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load approved relatos from Firebase
  useEffect(() => {
    const loadRelatos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const approvedRelatos = await firebaseService.getApprovedRelatos()

        // Convert Firebase relatos to Story format
        const convertedStories: Story[] = approvedRelatos.map(
          (relato: RelatoDocument, index: number) => ({
            id: relato.id,
            title: relato.title,
            category: 'relato',
            categoryLabel: 'Relato',
            description: relato.content.substring(0, 200) + '...',
            duration: `${Math.ceil(relato.content.length / 200)} min`,
            difficulty: 'Emotiva',
            background: relato.banner_image_url,
            // featured: index === 0
            author:  `${relato.name} ${relato.surname}`
          })
        )

        // Sort by newest first (assuming we want latest relatos in carousel)
        convertedStories.sort((a, b) => b.id.localeCompare(a.id))
        
        setStories(convertedStories)
      } catch (error: any) {
        console.error('Error loading relatos:', error)
        setError('Error al cargar los relatos')

        // Fallback to empty array
        setStories([])
      } finally {
        setIsLoading(false)
      }
    }

    loadRelatos()
  }, [])

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get latest 5 stories for carousel
  const latestStories = stories.slice(0, 5)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by filteredStories
  }

  if (isLoading) {
    return (
      <main className='h-84vh flex flex-col items-center justify-center gap-6'>
        <div className='text-center text-white'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-white'></div>
          <p className='text-lg'>Cargando relatos...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className='h-84vh flex flex-col items-center justify-center gap-6'>
        <div className='text-center text-white'>
          <svg className='mx-auto mb-4 h-16 w-16' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          <h2 className='mb-2 text-xl font-semibold'>Error al cargar relatos</h2>
          <p className='mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='rounded-lg bg-white px-4 py-2 text-gray-900 transition-colors hover:bg-gray-100'
          >
            Intentar nuevamente
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className='flex flex-col gap-10'>
      {/* Header and Carousel Section */}
      <div className='h-84vh flex flex-col gap-6'>
        <h1 className='font-balboa text-center text-5xl text-white md:text-6xl'>
          Relatos de Malvinas
        </h1>

        {stories.length === 0 ? (
          <div className='flex flex-1 items-center justify-center'>
            <div className='text-center text-white'>
              <svg
                className='mx-auto mb-4 h-16 w-16 opacity-50'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z'
                  clipRule='evenodd'
                />
              </svg>
              <h2 className='mb-2 text-xl font-semibold'>No hay relatos disponibles</h2>
              <p className='mb-4 opacity-75'>Aún no se han publicado relatos.</p>
              <a
                href='/relato/formulario'
                className='inline-block rounded-lg bg-white px-6 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-100'
              >
                Enviar el primer relato
              </a>
            </div>
          </div>
        ) : (
          <Carrousel stories={latestStories} />
        )}
      </div>

      {/* All Stories Grid Section */}
      {stories.length > 0 && (
        <div className='flex flex-col gap-y-10 bg-white'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <div className='flex flex-col gap-2'>
              <h2 className='font-balboa text-4xl md:text-6xl'>Todos los Relatos</h2>
              <p className='m-auto'>
                Explora todos los relatos y testimonios de la guerra de las Islas Malvinas
              </p>
            </div>

            <div className='flex w-full items-center gap-4 md:w-auto'>
              <form onSubmit={handleSearch} className='relative flex-1 md:w-auto' role='search'>
                <input
                  placeholder='Buscar relatos, autores...'
                  className='placeholder:text-muted-foreground border-muted-foreground p-y-2 p-x-4 w-full rounded-md border-2 pr-10'
                  aria-label='Búsqueda por título o autor'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type='submit'
                  className='bg-muted absolute end-3 top-1/2 flex -translate-y-1/2'
                  aria-label='Buscar relatos'
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
              <a href='/relato/formulario' className='h-full'>
                <div className='bg-secondary text-primary flex h-full w-max items-center justify-center whitespace-nowrap rounded-xl p-1.5 px-3.5 font-medium'>
                  Enviar Relato
                </div>
              </a>
            </div>
          </div>

          {/* No search results */}
          {filteredStories.length === 0 && searchQuery ? (
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
                <h3 className='mb-2 text-xl font-semibold text-gray-800'>
                  No se encontraron resultados
                </h3>
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
            /* Stories Grid */
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  className='border-dark bg-muted group relative flex h-full cursor-pointer flex-col overflow-hidden border transition-shadow hover:shadow-lg'
                >
                  <div className='relative aspect-square w-full overflow-hidden'>
                    <img
                      src={story.background}
                      alt={`Imagen del relato: ${story.title}`}
                      className='absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                      loading='lazy'
                    />
                    <div className='absolute top-4 left-4'>
                      <span className='bg-secondary text-primary inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider'>
                        {story.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-grow flex-col p-6'>
                    <h3 className='text-foreground mb-2 text-lg font-semibold line-clamp-2'>
                      {story.title}
                    </h3>
                    <p className='text-muted-foreground mb-2 text-sm'>
                      Por: {story.author}
                    </p>
                    <p className='text-muted-foreground mb-4 line-clamp-3 flex-grow text-sm'>
                      {story.description}
                    </p>
                    
                    <div className='flex items-center justify-between text-sm text-gray-600 mb-4'>
                      <span className='flex items-center gap-1'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='size-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <g fill='none'>
                            <path
                              fill='currentColor'
                              d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 2a1 1 0 0 1 .993.883L13 7v4.586l2.707 2.707a1 1 0 0 1-1.32 1.497l-.094-.083l-3-3a1 1 0 0 1-.284-.576L11 12V7a1 1 0 0 1 1-1'
                            />
                          </g>
                        </svg>
                        {story.duration}
                      </span>
                    </div>

                    <a
                      href={`/relatos/${story.id}`}
                      className='text-primary-foreground bg-primary hover:text-secondary focus:ring-6 block rounded p-3 text-center text-sm font-medium transition-colors focus:ring-[hsl(var(--card-foreground))]'
                    >
                      Leer Relato
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
