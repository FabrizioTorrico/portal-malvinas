import { useState } from 'react'

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

const stories: Story[] = [
  {
    id: '1',
    title: 'El Último Vuelo del Teniente García',
    category: 'heroismo',
    categoryLabel: 'Heroísmo',
    description:
      'La historia del piloto que sacrificó su vida para proteger a sus compañeros durante el ataque al HMS Sheffield. Un acto de valentía que quedó grabado en la memoria de la guerra.',
    duration: '12 min',
    difficulty: 'Intensa',
    background: 'https://images.unsplash.com/photo-1541367777708-7905fe94e90f?w=1200',
    featured: true,
    author: 'Juan Pérez'
  }
]

export default function RelatosMainContent() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className='h-84vh flex flex-col gap-6'>
      <h1 className='font-balboa text-center text-5xl text-white md:text-6xl'>
        Relatos de Malvinas
      </h1>

      <form className='flex justify-center'>
        <div className='w-2xl flex items-center gap-4'>
          <div className='relative h-14 w-full'>
            <input
              type='text'
              placeholder='Buscar relatos, héroes o acontecimientos...'
              className='rounded-4 placeholder:text-muted-foreground h-full w-full border-2 border-[hsl(var(--primary))] pe-14 ps-6'
              aria-label='Buscar relatos'
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

      <Carrousel stories={filteredStories} />
    </main>
  )
}
