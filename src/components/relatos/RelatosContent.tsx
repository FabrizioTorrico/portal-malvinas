import { useState } from 'react'

import Carrousel from './Carrousel'

export type Story = {
  id: number
  title: string
  category: string
  categoryLabel: string
  description: string
  duration: string
  difficulty: string
  background: string
  featured?: boolean
}

const stories: Story[] = [
  {
    id: 1,
    title: 'El Último Vuelo del Teniente García',
    category: 'heroismo',
    categoryLabel: 'Heroísmo',
    description:
      'La historia del piloto que sacrificó su vida para proteger a sus compañeros durante el ataque al HMS Sheffield. Un acto de valentía que quedó grabado en la memoria de la guerra.',
    duration: '12 min',
    difficulty: 'Intensa',
    background: 'https://images.unsplash.com/photo-1541367777708-7905fe94e90f?w=1200',
    featured: true
  },
  {
    id: 2,
    title: 'Cartas desde Puerto Argentino',
    category: 'cotidiana',
    categoryLabel: 'Vida Cotidiana',
    description:
      'Las emotivas cartas de un joven soldado a su familia, revelando la humanidad detrás del conflicto y la nostalgia por el hogar en tierras lejanas.',
    duration: '8 min',
    difficulty: 'Emotiva',
    background: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=1200'
  },
  {
    id: 3,
    title: 'La Batalla de Goose Green',
    category: 'batalla',
    categoryLabel: 'Batallas',
    description:
      'El relato épico de uno de los enfrentamientos más intensos del conflicto, donde el coraje y la estrategia se pusieron a prueba en territorio hostil.',
    duration: '15 min',
    difficulty: 'Épica',
    background: 'https://images.unsplash.com/photo-1569967164309-95b2d496c792?w=1200'
  },
  {
    id: 4,
    title: 'Hermanos en la Trinchera',
    category: 'compañerismo',
    categoryLabel: 'Compañerismo',
    description:
      'La profunda amistad forjada entre soldados de diferentes provincias, unidos por el destino común y la lealtad inquebrantable.',
    duration: '10 min',
    difficulty: 'Emotiva',
    background: 'https://images.unsplash.com/photo-1586796676567-040c7e8c6f8d?w=1200'
  },
  {
    id: 5,
    title: 'El Médico de Campaña',
    category: 'heroismo',
    categoryLabel: 'Heroísmo',
    description:
      'Dr. Manuel Rodríguez arriesgó su vida repetidamente para salvar heridos bajo fuego enemigo, convirtiéndose en leyenda entre los combatientes.',
    duration: '11 min',
    difficulty: 'Inspiradora',
    background: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=1200'
  },
  {
    id: 6,
    title: 'La Vigilia del Cabo Morales',
    category: 'batalla',
    categoryLabel: 'Batallas',
    description:
      '48 horas interminables defendiendo una posición estratégica con munición limitada y una determinación infinita.',
    duration: '13 min',
    difficulty: 'Intensa',
    background: 'https://images.unsplash.com/photo-1509719477099-4bb1e5c12324?w=1200'
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
    <main className='h-84vh flex flex-col gap-8'>
      <h1 className='font-balboa text-center text-6xl text-white md:text-7xl'>Relatos malvinas</h1>
      <form className='flex justify-center'>
        <div className='relative mx-12 w-full max-w-xl'>
          <input
            type='text'
            placeholder='Buscar relatos, héroes o acontecimientos...'
            className='rounded-4 h-16 w-full border-2 border-[hsl(var(--primary))] pe-14 ps-6'
            aria-label='Buscar relatos'
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type='submit'
            className='absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2'
            aria-label='Buscar'
          >
            {/* <Icon aria-label='Search Icon' name='search' className='text-muted-foreground size-5' /> */}
          </button>
        </div>
      </form>

      <Carrousel stories={filteredStories} />
    </main>
  )
}
