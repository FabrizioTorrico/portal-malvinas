import { useState } from 'react'

import type { Story } from './RelatosContent'

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
      'absolute w-80 h-96 bg-card  border-primary border-3 rounded-xl p-6 cursor-pointer shadow-2xl transition-all duration-700 ease-out'

    if (index === currentIndex) {
      return `${baseClasses} left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-105 z-10 shadow-[0_30px_60px_rgba(207,219,237,0.2)]`
    } else if (index === (currentIndex - 1 + stories.length) % stories.length) {
      return `${baseClasses} left-0 top-1/2 transform  -translate-y-1/2  scale-80 opacity-60 z-5`
    } else if (index === (currentIndex + 1) % stories.length) {
      return `${baseClasses} right-0 top-1/2 transform  -translate-y-1/2  scale-80 opacity-60 z-5`
    } else {
      return `${baseClasses} left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-50 opacity-0`
    }
  }

  return (
    <div aria-label='La vida la vida es un carrouseell'>
      <section className='flex flex-1 items-center justify-center px-8'>
        <div className='relative h-[500px] w-full max-w-6xl'>
          <div className='relative h-full w-full'>
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={getCardClasses(index)}
                onClick={() => goToStory(index)}
              >
                {story.featured && (
                  <div className='absolute -right-3 -top-3 animate-pulse rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-2 text-[#221833] shadow-lg'>
                    {/* <Star className='h-5 w-5 fill-current' /> */}
                  </div>
                )}

                <div className='bg-secondary text-primary mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold tracking-wider'>
                  {story.categoryLabel}
                </div>

                <h3 className='text-foreground mb-4 text-2xl font-bold leading-tight drop-shadow-md'>
                  {story.title}
                </h3>

                <p className='text-foreground mb-6 h-24 overflow-hidden text-sm leading-relaxed'>
                  {story.description}
                </p>

                <div className='text-foreground mb-6 flex items-center justify-between text-sm font-bold'>
                  <span>⏱️ {story.duration}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // readStory(story.id)
                  }}
                  className='bg-primary text-secondary text-md w-full transform rounded-lg border-2 py-3 font-bold tracking-wide transition-all duration-300 hover:-translate-y-1 hover:border-[#CFDBED]'
                >
                  Leer Relato
                </button>
              </div>
            ))}
          </div>

          <button
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
            {/* <ChevronRight className='h-6 w-6' /> */}
          </button>

          <div className='absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-12 transform gap-2'>
            {stories.map((_, index) => (
              <button
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
      </section>
    </div>
  )
}
