/**
 * Image processing utilities for client-side compression and validation
 */

export interface ImageValidationResult {
  isValid: boolean
  error?: string
}

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Validate image file type and size
 */
export const validateImageFile = (file: File, maxSizeMB: number = 10): ImageValidationResult => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y WebP.'
    }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`
    }
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'El archivo está vacío.'
    }
  }

  return { isValid: true }
}

/**
 * Generate unique filename for uploads
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${timestamp}_${randomId}.${extension}`
}

/**
 * Compress image using canvas API
 */
export const compressImage = (file: File, options: CompressionOptions = {}): Promise<File> => {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = 'jpeg' } = options

    // Create image element
    const img = new Image()
    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'))
          return
        }

        // Calculate new dimensions
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'))
              return
            }

            // Create new file with compressed data
            const compressedFile = new File([blob], generateUniqueFileName(file.name), {
              type: `image/${format}`,
              lastModified: Date.now()
            })

            resolve(compressedFile)
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
    }

    // Load image
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create thumbnail from image file
 */
export const createThumbnail = (file: File, size: number = 200): Promise<File> => {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg'
  })
}

/**
 * Get image dimensions
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Convert image to base64 data URL
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Error al convertir imagen a base64'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Check if image needs compression
 */
export const shouldCompressImage = (
  file: File,
  maxSizeMB: number = 2,
  maxDimension: number = 1920
): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      // Check file size
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        resolve(true)
        return
      }

      // Check dimensions
      const dimensions = await getImageDimensions(file)
      if (dimensions.width > maxDimension || dimensions.height > maxDimension) {
        resolve(true)
        return
      }

      resolve(false)
    } catch (error) {
      // If we can't determine, err on the side of compression
      resolve(true)
    }
  })
}

/**
 * Smart image compression - only compress if needed
 */
export const smartCompressImage = async (
  file: File,
  options: CompressionOptions & { maxSizeMB?: number } = {}
): Promise<File> => {
  const { maxSizeMB = 2, ...compressionOptions } = options

  const needsCompression = await shouldCompressImage(file, maxSizeMB)

  if (!needsCompression) {
    return file
  }

  return compressImage(file, compressionOptions)
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

/**
 * Batch process multiple images
 */
export const batchProcessImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> => {
  const processedFiles: File[] = []

  for (const file of files) {
    try {
      const processed = await smartCompressImage(file, options)
      processedFiles.push(processed)
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
      // Include original file if processing fails
      processedFiles.push(file)
    }
  }

  return processedFiles
}
