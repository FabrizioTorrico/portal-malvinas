import { useCallback, useState } from 'react'

import { firebaseService } from '../lib/firebase.service'
import type { FirebaseError } from '../types/firebase.types'

interface UploadState {
  isUploading: boolean
  progress: number
  url: string | null
  error: string | null
}

interface MultiUploadState {
  dni: UploadState
  banner: UploadState
  image: UploadState
  isAnyUploading: boolean
}

const initialUploadState: UploadState = {
  isUploading: false,
  progress: 0,
  url: null,
  error: null
}

const initialMultiUploadState: MultiUploadState = {
  dni: { ...initialUploadState },
  banner: { ...initialUploadState },
  image: { ...initialUploadState },
  isAnyUploading: false
}

/**
 * Hook for handling multiple file uploads to Firebase Storage
 */
export const useMultiUpload = () => {
  const [uploadStates, setUploadStates] = useState<MultiUploadState>(initialMultiUploadState)

  const updateUploadState = useCallback(
    (type: keyof Omit<MultiUploadState, 'isAnyUploading'>, updates: Partial<UploadState>) => {
      setUploadStates((prev) => {
        const newState = {
          ...prev,
          [type]: { ...prev[type], ...updates }
        }

        // Update isAnyUploading flag
        newState.isAnyUploading =
          newState.dni.isUploading || newState.banner.isUploading || newState.image.isUploading

        return newState
      })
    },
    []
  )

  const uploadDniImage = useCallback(
    async (file: File, type: 'relatos' | 'portal-memoria') => {
      updateUploadState('dni', { isUploading: true, progress: 0, error: null })

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          updateUploadState('dni', { progress: Math.min(uploadStates.dni.progress + 10, 90) })
        }, 200)

        const url = await firebaseService.uploadDniImage(file, type)

        clearInterval(progressInterval)
        updateUploadState('dni', {
          isUploading: false,
          progress: 100,
          url,
          error: null
        })

        return url
      } catch (error: any) {
        const firebaseError = error as FirebaseError
        updateUploadState('dni', {
          isUploading: false,
          progress: 0,
          error: firebaseError.userMessage || 'Error al subir imagen DNI'
        })
        throw error
      }
    },
    [updateUploadState, uploadStates.dni.progress]
  )

  const uploadBannerImage = useCallback(
    async (file: File) => {
      updateUploadState('banner', { isUploading: true, progress: 0, error: null })

      try {
        const progressInterval = setInterval(() => {
          updateUploadState('banner', { progress: Math.min(uploadStates.banner.progress + 10, 90) })
        }, 200)

        const url = await firebaseService.uploadBannerImage(file)

        clearInterval(progressInterval)
        updateUploadState('banner', {
          isUploading: false,
          progress: 100,
          url,
          error: null
        })

        return url
      } catch (error: any) {
        const firebaseError = error as FirebaseError
        updateUploadState('banner', {
          isUploading: false,
          progress: 0,
          error: firebaseError.userMessage || 'Error al subir imagen banner'
        })
        throw error
      }
    },
    [updateUploadState, uploadStates.banner.progress]
  )

  const uploadPortalMemoriaImage = useCallback(
    async (file: File) => {
      updateUploadState('image', { isUploading: true, progress: 0, error: null })

      try {
        const progressInterval = setInterval(() => {
          updateUploadState('image', { progress: Math.min(uploadStates.image.progress + 10, 90) })
        }, 200)

        const url = await firebaseService.uploadPortalMemoriaImage(file)

        clearInterval(progressInterval)
        updateUploadState('image', {
          isUploading: false,
          progress: 100,
          url,
          error: null
        })

        return url
      } catch (error: any) {
        const firebaseError = error as FirebaseError
        updateUploadState('image', {
          isUploading: false,
          progress: 0,
          error: firebaseError.userMessage || 'Error al subir imagen'
        })
        throw error
      }
    },
    [updateUploadState, uploadStates.image.progress]
  )

  const resetUpload = useCallback(
    (type: keyof Omit<MultiUploadState, 'isAnyUploading'>) => {
      updateUploadState(type, initialUploadState)
    },
    [updateUploadState]
  )

  const resetAllUploads = useCallback(() => {
    setUploadStates(initialMultiUploadState)
  }, [])

  return {
    uploadStates,
    uploadDniImage,
    uploadBannerImage,
    uploadPortalMemoriaImage,
    resetUpload,
    resetAllUploads
  }
}

/**
 * Hook for single file upload
 */
export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>(initialUploadState)

  const uploadFile = useCallback(
    async (file: File, uploadFunction: (file: File) => Promise<string>) => {
      setUploadState({ isUploading: true, progress: 0, url: null, error: null })

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadState((prev) => ({
            ...prev,
            progress: Math.min(prev.progress + 10, 90)
          }))
        }, 200)

        const url = await uploadFunction(file)

        clearInterval(progressInterval)
        setUploadState({
          isUploading: false,
          progress: 100,
          url,
          error: null
        })

        return url
      } catch (error: any) {
        const firebaseError = error as FirebaseError
        setUploadState({
          isUploading: false,
          progress: 0,
          url: null,
          error: firebaseError.userMessage || 'Error al subir archivo'
        })
        throw error
      }
    },
    []
  )

  const resetUpload = useCallback(() => {
    setUploadState(initialUploadState)
  }, [])

  return {
    uploadState,
    uploadFile,
    resetUpload
  }
}
