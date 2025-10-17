import { useState } from 'react'

import type { Story } from './RelatosMainContentFirebase'

export default function Carrousel({ stories }: { stories: Story[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  // const [readStory, setReadStory] = useState<Story | null>(null)
  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length)
  }

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length)
  }

  const goToStory = (index: number) => {
    setCurrentIndex(index)
  }

  const getCardClasses = (index: number) => {
    const baseClasses =
      'absolute w-80 h-fit bg-card border-primary border-3 rounded-xl p-6 cursor-pointer shadow-2xl transition-all duration-700 ease-out left-1/2 top-1/2' // <-- ¡Aquí el cambio!

    if (index === currentIndex) {
      // current: Centrada por completo con scale más grande y más opacidad.
      return `${baseClasses} max-lg:scale-90 transform -translate-x-1/2 -translate-y-1/2 scale-105 z-10 shadow-[0_30px_60px_rgba(207,219,237,0.2)]`
    } else if (index === (currentIndex - 1 + stories.length) % stories.length) {
      // izquierda: Movida a la izquierda del centro.
      return `${baseClasses} max-lg:hidden transform -translate-x-[150%] -translate-y-1/2 scale-80 opacity-60 z-5` // Ajusta -translate-x-[150%] según necesites
    } else if (index === (currentIndex + 1) % stories.length) {
      // derecha: Movida a la derecha del centro.
      return `${baseClasses} max-lg:hidden transform translate-x-[50%] -translate-y-1/2 scale-80 opacity-60 z-5` // Ajusta translate-x-[50%] según necesites
    } else {
      // atras: Misma posición central (invisible), lista para aparecer de forma fluida.
      return `${baseClasses} max-lg:hidden transform -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0`
    }
  }

  return (
    <section className='flex flex-1 items-center justify-center'>
      <div className='flex max-w-5xl h-full w-full px-8 pb-4'>
        <div className='relative h-full w-full max-w-6xl'>
          <div className='relative h-full w-full'>
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={getCardClasses(index)}
                onClick={() => goToStory(index)}
                aria-hidden={index !== currentIndex}
              >

                <label className='bg-secondary text-primary mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-bold tracking-wider'>
                  {story.categoryLabel}
                </label>

                <p className='text-foreground mb-3 text-2xl font-bold leading-tight drop-shadow-md'>
                  {story.title}
                </p>

                <div className='text-foreground mb-4 flex items-center justify-between text-sm font-bold'>
                  <span className='flex items-center gap-2'>
                    Autor: {story.author}
                  </span>
                </div>

                <p className='text-foreground mb-4 h-24 overflow-hidden text-sm leading-relaxed'>
                  {story.description}
                </p>


                

                 <div className='text-foreground mb-4 flex items-center justify-between text-sm font-bold'>
                  <span className='flex items-center gap-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='text-foreground size-5'
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
                    </svg>{' '}
                    {story.duration}
                  </span>
                </div>

                <a href={`relatos/${story.id}`}>
                  <div
                    aria-hidden={index !== currentIndex}
                    onClick={(e) => {
                      e.stopPropagation()
                      // readStory(story.id)
                    }}
                    className='bg-primary text-secondary text-md flex w-full transform items-center justify-center rounded-lg border-2 py-3 font-bold tracking-wide transition-all duration-300 hover:-translate-y-1 hover:border-[#CFDBED]'
                  >
                    Leer Relato
                  </div>
                </a>
              </div>
            ))}
          </div>

          <button
            aria-label='Anterior relato'
            onClick={prevStory}
            className='bg-primary absolute left-0 top-1/2 z-20 flex h-12 w-12 -translate-x-12 -translate-y-1/2 transform items-center justify-center rounded-full border-2 border-[#CFDBED]/40 backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:border-[#CFDBED] hover:bg-[#CFDBED]/20'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 text-[hsl(var(--secondary))]'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 19l-7-7 7-7'
              ></path>
            </svg>
          </button>

          <button
            aria-label='Siguiente relato'
            onClick={nextStory}
            className='bg-primary absolute right-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 translate-x-12 transform items-center justify-center rounded-full border-2 border-[#CFDBED]/40 text-[#CFDBED] backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:border-[#CFDBED] hover:bg-[#CFDBED]/20'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='text-secondary h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9 5l7 7-7 7'
              ></path>
            </svg>
          </button>

          <div className='absolute bottom-0 left-1/2 flex -translate-x-1/2 transform gap-2'>
            {stories.map((_, index) => (
              <button
                aria-hidden='true'
                key={index}
                onClick={() => goToStory(index)}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'scale-125 bg-[#CFDBED]'
                    : 'bg-[#CFDBED]/30 hover:bg-[#CFDBED]/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
