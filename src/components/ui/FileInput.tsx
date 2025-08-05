import React, { useRef, useState, type FC } from 'react'

interface FileInputProps {
  id: string
  name: string
  label: string
  description?: string
  required?: boolean
  value: File | null
  onChange: (file: File | null) => void
  onUpload?: (file: File) => Promise<void>
  uploadProgress?: number
  isUploading?: boolean
  uploadError?: string | null
  error?: string
  maxSize?: number // in MB
  disabled?: boolean
  accept?: string
}

export const FileInput: FC<FileInputProps> = ({
  id,
  name,
  label,
  description,
  required = false,
  value,
  onChange,
  onUpload,
  uploadProgress = 0,
  isUploading = false,
  uploadError,
  error,
  maxSize = 10,
  disabled = false,
  accept = 'image/*'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = async (file: File | null) => {
    onChange(file)

    if (file && onUpload) {
      try {
        await onUpload(file)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    handleFileSelect(file)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    if (disabled) return

    const files = event.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const hasError = error || uploadError

  return (
    <div className='space-y-2'>
      {/* Label */}
      <label htmlFor={id} className='block font-bold text-gray-700'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>

      {/* Description */}
      {description && <p className='text-sm text-gray-500'>{description}</p>}

      {/* File Input Area */}
      <div
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : hasError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type='file'
          id={id}
          name={name}
          accept={accept}
          onChange={handleInputChange}
          className='hidden'
          required={required}
          disabled={disabled}
        />

        <div className='text-center'>
          {value ? (
            <div className='space-y-2'>
              {/* File Info */}
              <div className='flex items-center justify-center space-x-2'>
                <svg className='h-8 w-8 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
                    clipRule='evenodd'
                  />
                </svg>
                <div className='text-left'>
                  <p className='text-sm font-medium text-gray-900'>{value.name}</p>
                  <p className='text-xs text-gray-500'>{formatFileSize(value.size)}</p>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className='space-y-1'>
                  <div className='h-2 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-2 rounded-full bg-blue-600 transition-all duration-300'
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className='text-xs text-gray-600'>Subiendo... {uploadProgress}%</p>
                </div>
              )}

              {/* Success State */}
              {!isUploading && !uploadError && uploadProgress === 100 && (
                <div className='flex items-center justify-center space-x-1 text-green-600'>
                  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-xs'>Subido exitosamente</span>
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-2'>
              <svg
                className='mx-auto h-12 w-12 text-gray-400'
                stroke='currentColor'
                fill='none'
                viewBox='0 0 48 48'
              >
                <path
                  d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <div>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-blue-600'>Haz clic para subir</span> o arrastra
                  y suelta
                </p>
                <p className='text-xs text-gray-500'>PNG, JPG, WebP hasta {maxSize}MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {hasError && (
        <div className='flex items-center space-x-1 text-red-600'>
          <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          <span className='text-sm'>{error || uploadError}</span>
        </div>
      )}
    </div>
  )
}
