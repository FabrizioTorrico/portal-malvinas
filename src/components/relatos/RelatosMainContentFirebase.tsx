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
      story.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    <main className='h-84vh flex flex-col gap-6'>
      <h1 className='font-balboa text-center text-5xl text-white md:text-6xl'>
        Relatos de Malvinas
      </h1>

      <form className='flex justify-center' onSubmit={(e) => e.preventDefault()}>
        <div className='w-2xl flex items-center gap-4'>
          <div className='relative h-14 w-full'>
            <input
              type='text'
              placeholder='Buscar relatos, héroes o acontecimientos...'
              className='rounded-4 placeholder:text-muted-foreground h-full w-full border-2 border-[hsl(var(--primary))] pe-14 ps-6'
              aria-label='Buscar relatos'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button
              type='submit'
              className='absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2'
              aria-label='Buscar'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='text-muted-foreground size-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                aria-hidden='true'
              >
                <path
                  fill='currentColor'
                  d='M5 10a5 5 0 1 1 10 0a5 5 0 0 1-10 0m5-7a7 7 0 1 0 4.192 12.606l5.1 5.101a1 1 0 0 0 1.415-1.414l-5.1-5.1A7 7 0 0 0 10 3'
                />
              </svg>
            </button>
          </div>
          <a href='/relato/formulario' className='h-full'>
            <div className='bg-secondary text-primary flex h-full w-max items-center justify-center rounded-xl p-1.5 px-3.5 font-medium'>
              Enviar Relato
            </div>
          </a>
        </div>
      </form>

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
      ) : filteredStories.length === 0 ? (
        <div className='flex flex-1 items-center justify-center'>
          <div className='text-center text-white'>
            <svg
              className='mx-auto mb-4 h-16 w-16 opacity-50'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                clipRule='evenodd'
              />
            </svg>
            <h2 className='mb-2 text-xl font-semibold'>No se encontraron resultados</h2>
            <p className='mb-4 opacity-75'>No hay relatos que coincidan con "{searchQuery}".</p>
            <button
              onClick={() => setSearchQuery('')}
              className='rounded-lg bg-white px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-100'
            >
              Limpiar búsqueda
            </button>
          </div>
        </div>
      ) : (
        <Carrousel stories={filteredStories} />
      )}
    </main>
  )
}
