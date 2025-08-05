import { type FC } from 'react'

interface ProgressIndicatorProps {
  progress: number // 0-100
  isUploading?: boolean
  showPercentage?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow'
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  progress,
  isUploading = false,
  showPercentage = true,
  label,
  size = 'md',
  color = 'blue'
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className='w-full space-y-1'>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className='flex items-center justify-between'>
          {label && (
            <span className={`font-medium text-gray-700 ${textSizeClasses[size]}`}>{label}</span>
          )}
          {showPercentage && (
            <span className={`text-gray-600 ${textSizeClasses[size]}`}>
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className={`w-full rounded-full bg-gray-200 ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out ${
            isUploading ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>

      {/* Loading Animation */}
      {isUploading && progress < 100 && (
        <div className='mt-2 flex items-center justify-center space-x-1'>
          <div className='h-3 w-3 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <span className='text-xs text-gray-600'>Procesando...</span>
        </div>
      )}
    </div>
  )
}

interface CircularProgressProps {
  progress: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
}

export const CircularProgress: FC<CircularProgressProps> = ({
  progress,
  size = 40,
  strokeWidth = 4,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = false
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width={size} height={size} className='-rotate-90 transform'>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill='transparent'
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          className='transition-all duration-300 ease-out'
        />
      </svg>
      {showPercentage && (
        <span
          className='absolute text-xs font-medium text-gray-700'
          style={{ fontSize: `${size / 5}px` }}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}

interface StepProgressProps {
  steps: string[]
  currentStep: number
  completedSteps?: number[]
  errorStep?: number
}

export const StepProgress: FC<StepProgressProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  errorStep
}) => {
  return (
    <div className='w-full'>
      <div className='flex items-center justify-between'>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isCurrent = index === currentStep
          const isError = index === errorStep
          const isUpcoming = index > currentStep && !isCompleted

          return (
            <div key={index} className='flex items-center'>
              {/* Step Circle */}
              <div className='flex items-center'>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium ${
                    isError
                      ? 'border-red-500 bg-red-500 text-white'
                      : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : isCurrent
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {isError ? (
                    <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : isCompleted ? (
                    <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`ml-2 text-sm font-medium ${
                    isError
                      ? 'text-red-600'
                      : isCompleted
                        ? 'text-green-600'
                        : isCurrent
                          ? 'text-blue-600'
                          : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 flex-1 ${
                    isCompleted || (isCurrent && index < currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
