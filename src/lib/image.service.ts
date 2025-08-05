import { VALIDATION_CONSTANTS } from '../types/firebase.types'
import { createFirebaseError } from './firebase.errors'

export interface ImageValidationResult {
  isValid: boolean
  error?: string
  errorCode?: string
}

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
}

/**
 * Image processing and validation service
 */
export class ImageService {
  /**
   * Validate image file
   */
  validateImageFile(
    file: File,
    maxSize: number = VALIDATION_CONSTANTS.MAX_BANNER_IMAGE_SIZE
  ): ImageValidationResult {
    // Check if file exists
    if (!file) {
      return {
        isValid: false,
        error: 'Este archivo es obligatorio.',
        errorCode: 'file-required'
      }
    }

    // Check file type
    if (!(VALIDATION_CONSTANTS.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y WebP.',
        errorCode: 'invalid-file-type'
      }
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return {
        isValid: false,
        error: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`,
        errorCode: 'file-too-large'
      }
    }

    return { isValid: true }
  }

  /**
   * Validate DNI image
   */
  validateDniImage(file: File): ImageValidationResult {
    return this.validateImageFile(file, VALIDATION_CONSTANTS.MAX_DNI_IMAGE_SIZE)
  }

  /**
   * Validate banner image
   */
  validateBannerImage(file: File): ImageValidationResult {
    return this.validateImageFile(file, VALIDATION_CONSTANTS.MAX_BANNER_IMAGE_SIZE)
  }

  /**
   * Validate portal memoria image
   */
  validatePortalMemoriaImage(file: File): ImageValidationResult {
    return this.validateImageFile(file, VALIDATION_CONSTANTS.MAX_PORTAL_IMAGE_SIZE)
  }

  /**
   * Generate unique filename
   */
  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg'

    // Clean original name (remove special characters)
    const cleanName = originalName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
      .substring(0, 20) // Limit length

    return `${timestamp}_${randomId}_${cleanName}.${extension}`
  }

  /**
   * Compress image using canvas
   */
  async compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = 'jpeg' } = options

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      img.onload = () => {
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
              reject(new Error('Failed to compress image'))
              return
            }

            // Create new file with compressed data
            const compressedFile = new File([blob], this.generateUniqueFileName(file.name), {
              type: `image/${format}`,
              lastModified: Date.now()
            })

            resolve(compressedFile)
          },
          `image/${format}`,
          quality
        )
      }

      img.onerror = () => {
        reject(createFirebaseError('file-corrupted'))
      }

      // Load image
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Create thumbnail from image
   */
  async createThumbnail(file: File, size: number = 200): Promise<File> {
    return this.compressImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg'
    })
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }

      img.onerror = () => {
        reject(createFirebaseError('file-corrupted'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Check if image needs compression
   */
  async shouldCompressImage(file: File, maxSize: number = 2 * 1024 * 1024): Promise<boolean> {
    if (file.size <= maxSize) {
      return false
    }

    try {
      const dimensions = await this.getImageDimensions(file)
      return dimensions.width > 1920 || dimensions.height > 1080
    } catch {
      return true // Compress if we can't determine dimensions
    }
  }

  /**
   * Process image for upload (validate and optionally compress)
   */
  async processImageForUpload(
    file: File,
    validationType: 'dni' | 'banner' | 'portal-memoria'
  ): Promise<File> {
    // Validate file
    let validation: ImageValidationResult

    switch (validationType) {
      case 'dni':
        validation = this.validateDniImage(file)
        break
      case 'banner':
        validation = this.validateBannerImage(file)
        break
      case 'portal-memoria':
        validation = this.validatePortalMemoriaImage(file)
        break
    }

    if (!validation.isValid) {
      throw createFirebaseError(validation.errorCode || 'invalid-file-type')
    }

    // Check if compression is needed
    const maxSizeForCompression =
      validationType === 'dni'
        ? VALIDATION_CONSTANTS.MAX_DNI_IMAGE_SIZE / 2
        : VALIDATION_CONSTANTS.MAX_BANNER_IMAGE_SIZE / 2

    const needsCompression = await this.shouldCompressImage(file, maxSizeForCompression)

    if (needsCompression) {
      try {
        return await this.compressImage(file, {
          maxWidth: validationType === 'dni' ? 800 : 1920,
          maxHeight: validationType === 'dni' ? 600 : 1080,
          quality: 0.8
        })
      } catch (error) {
        console.warn('Image compression failed, using original:', error)
        return file
      }
    }

    return file
  }

  /**
   * Convert file to base64 for preview
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        resolve(reader.result as string)
      }

      reader.onerror = () => {
        reject(createFirebaseError('file-corrupted'))
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * Create image preview URL
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Revoke preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
  }

  /**
   * Batch validate multiple images
   */
  validateMultipleImages(
    files: File[],
    validationType: 'dni' | 'banner' | 'portal-memoria'
  ): { valid: File[]; invalid: { file: File; error: string }[] } {
    const valid: File[] = []
    const invalid: { file: File; error: string }[] = []

    files.forEach((file) => {
      let validation: ImageValidationResult

      switch (validationType) {
        case 'dni':
          validation = this.validateDniImage(file)
          break
        case 'banner':
          validation = this.validateBannerImage(file)
          break
        case 'portal-memoria':
          validation = this.validatePortalMemoriaImage(file)
          break
      }

      if (validation.isValid) {
        valid.push(file)
      } else {
        invalid.push({
          file,
          error: validation.error || 'Archivo inválido'
        })
      }
    })

    return { valid, invalid }
  }
}

// Export singleton instance
export const imageService = new ImageService()
