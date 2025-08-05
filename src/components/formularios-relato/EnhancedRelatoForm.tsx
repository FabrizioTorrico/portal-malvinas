import { es } from '@blocknote/core/locales'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import React, { useState, type FC } from 'react'

import { useMultiUpload } from '../../hooks/useFirebaseUpload'
import { firebaseService } from '../../lib/firebase.service'
import {
  formatValidationErrors,
  sanitizeFormData,
  validateRelatoSubmission
} from '../../lib/validation.schemas'
import type { RelatoFormData } from '../../types/firebase.types'
import { FileInput } from '../ui/FileInput'
import { ProgressIndicator } from '../ui/ProgressIndicator'

import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'

interface FormErrors {
  [key: string]: string
}

interface SubmissionState {
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
  submissionId: string | null
}

const EnhancedRelatoForm: FC = () => {
  // Form state
  const [formData, setFormData] = useState<RelatoFormData>({
    name: '',
    surname: '',
    phone: '',
    title: '',
    content: '',
    dni_image: null,
    banner_image: null
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
    submissionId: null
  })

  // Upload hooks
  const { uploadStates, uploadDniImage, uploadBannerImage, resetAllUploads } = useMultiUpload()

  // BlockNote editor
  const storedTheme = localStorage.getItem('theme') || 'light'
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: 'paragraph',
        content:
          'Este es el contenido del relato, puedes teclear o presiona / para ver más comandos'
      }
    ],
    dictionary: es,
    disableExtensions: ['image', 'codeBlock', 'file', 'audio'],
    uploadFile: async () => {
      return ''
    }
  })

  // Form handlers
  const updateField = (field: keyof RelatoFormData, value: any) => {
    setFormData((prev: RelatoFormData) => ({ ...prev, [field]: value }))

    // Clear field error when user starts typing
    if (formErrors[field as string]) {
      setFormErrors((prev: FormErrors) => ({ ...prev, [field as string]: '' }))
    }
  }

  const handleDniUpload = async (file: File) => {
    try {
      await uploadDniImage(file, 'relatos')
    } catch (error) {
      console.error('DNI upload failed:', error)
    }
  }

  const handleBannerUpload = async (file: File) => {
    try {
      await uploadBannerImage(file)
    } catch (error) {
      console.error('Banner upload failed:', error)
    }
  }

  const validateForm = async (): Promise<boolean> => {
    try {
      // Get current content from editor
      const content = await editor.blocksToMarkdownLossy(editor.document)

      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        content,
        dni_image: formData.dni_image,
        banner_image: formData.banner_image
      }

      // Sanitize form data
      const sanitizedData = sanitizeFormData(dataToValidate)

      // Validate with Zod schema
      const validation = validateRelatoSubmission(sanitizedData)

      if (!validation.success) {
        const errors = formatValidationErrors(validation.error)
        setFormErrors(errors)
        return false
      }

      // Update form data with sanitized values
      setFormData((prev) => ({
        ...prev,
        ...sanitizedData,
        content
      }))

      setFormErrors({})
      return true
    } catch (error) {
      console.error('Form validation error:', error)
      setFormErrors({ general: 'Error al validar el formulario' })
      return false
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Prevent double submission
    if (submissionState.isSubmitting || uploadStates.isAnyUploading) {
      return
    }

    setSubmissionState({
      isSubmitting: true,
      isSuccess: false,
      error: null,
      submissionId: null
    })

    try {
      // Validate form
      const isValid = await validateForm()
      if (!isValid) {
        throw new Error('Por favor, corrige los errores en el formulario')
      }

      // Check if images are uploaded
      if (!uploadStates.dni.url || !uploadStates.banner.url) {
        throw new Error('Por favor, espera a que se suban todas las imágenes')
      }

      // Get current content from editor
      const content = await editor.blocksToMarkdownLossy(editor.document)

      // Prepare submission data
      const submissionData = {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        title: formData.title,
        content,
        dni_image_url: uploadStates.dni.url,
        banner_image_url: uploadStates.banner.url
      }

      // Submit to Firebase
      const submissionId = await firebaseService.createRelato(submissionData)

      // Success
      setSubmissionState({
        isSubmitting: false,
        isSuccess: true,
        error: null,
        submissionId
      })

      // Show success message
      setTimeout(() => {
        resetForm()
      }, 3000)
    } catch (error: any) {
      console.error('Submission error:', error)
      setSubmissionState({
        isSubmitting: false,
        isSuccess: false,
        error: error.message || 'Error al enviar el formulario. Intenta nuevamente.',
        submissionId: null
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      phone: '',
      title: '',
      content: '',
      dni_image: null,
      banner_image: null
    })
    setFormErrors({})
    setSubmissionState({
      isSubmitting: false,
      isSuccess: false,
      error: null,
      submissionId: null
    })
    resetAllUploads()

    // Reset editor
    editor.replaceBlocks(editor.document, [
      {
        type: 'paragraph',
        content:
          'Este es el contenido del relato, puedes teclear o presiona / para ver más comandos'
      }
    ])
  }

  // Success message
  if (submissionState.isSuccess) {
    return (
      <div className='mx-auto max-w-2xl rounded-lg border border-green-200 bg-green-50 p-6'>
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
            <svg className='h-8 w-8 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <h2 className='mb-2 text-2xl font-bold text-green-800'>¡Relato enviado exitosamente!</h2>
          <p className='mb-4 text-green-700'>
            Tu relato ha sido enviado y está pendiente de aprobación. Te notificaremos cuando sea
            publicado.
          </p>
          <p className='mb-6 text-sm text-green-600'>ID de envío: {submissionState.submissionId}</p>
          <button
            onClick={resetForm}
            className='rounded bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700'
          >
            Enviar otro relato
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* General Error */}
      {(submissionState.error || formErrors.general) && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='flex'>
            <svg
              className='mr-2 mt-0.5 h-5 w-5 text-red-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            <div>
              <h3 className='text-sm font-medium text-red-800'>Error en el formulario</h3>
              <p className='mt-1 text-sm text-red-700'>
                {submissionState.error || formErrors.general}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {/* Name */}
        <div>
          <label htmlFor='name' className='mb-2 block font-bold text-gray-700'>
            Nombre <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={`placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm ${
              formErrors.name ? 'border-red-500 bg-red-50' : ''
            }`}
            placeholder='ej. Juan Pedro'
            required
            disabled={submissionState.isSubmitting}
          />
          {formErrors.name && <p className='mt-1 text-sm text-red-600'>{formErrors.name}</p>}
        </div>

        {/* Surname */}
        <div>
          <label htmlFor='surname' className='mb-2 block font-bold text-gray-700'>
            Apellido <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='surname'
            name='surname'
            value={formData.surname}
            onChange={(e) => updateField('surname', e.target.value)}
            className={`placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm ${
              formErrors.surname ? 'border-red-500 bg-red-50' : ''
            }`}
            placeholder='ej. Pérez Apaolaza'
            required
            disabled={submissionState.isSubmitting}
          />
          {formErrors.surname && <p className='mt-1 text-sm text-red-600'>{formErrors.surname}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor='phone' className='mb-2 block font-bold text-gray-700'>
            Teléfono <span className='text-red-500'>*</span>
          </label>
          <input
            type='tel'
            id='phone'
            name='phone'
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={`placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm ${
              formErrors.phone ? 'border-red-500 bg-red-50' : ''
            }`}
            placeholder='ej. 221012345678'
            required
            disabled={submissionState.isSubmitting}
          />
          {formErrors.phone && <p className='mt-1 text-sm text-red-600'>{formErrors.phone}</p>}
        </div>

        {/* Title */}
        <div>
          <label htmlFor='title' className='mb-2 block font-bold text-gray-700'>
            Título del relato <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className={`placeholder:text-muted-foreground border-foreground w-full border-2 px-4 py-2 shadow-sm ${
              formErrors.title ? 'border-red-500 bg-red-50' : ''
            }`}
            placeholder='ej. Mi historia en Malvinas'
            required
            disabled={submissionState.isSubmitting}
          />
          {formErrors.title && <p className='mt-1 text-sm text-red-600'>{formErrors.title}</p>}
        </div>
      </div>

      {/* File Uploads */}
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        {/* DNI Image */}
        <FileInput
          id='dni_image'
          name='dni_image'
          label='Foto DNI'
          description='Debe mostrarse el distintivo especial de Malvinas.'
          required
          value={formData.dni_image}
          onChange={(file) => updateField('dni_image', file)}
          onUpload={handleDniUpload}
          uploadProgress={uploadStates.dni.progress}
          isUploading={uploadStates.dni.isUploading}
          uploadError={uploadStates.dni.error}
          error={formErrors.dni_image}
          maxSize={5}
          disabled={submissionState.isSubmitting}
        />

        {/* Banner Image */}
        <FileInput
          id='banner_image'
          name='banner_image'
          label='Imagen Banner'
          description='Imagen principal que acompañará tu relato.'
          value={formData.banner_image}
          onChange={(file) => updateField('banner_image', file)}
          onUpload={handleBannerUpload}
          uploadProgress={uploadStates.banner.progress}
          isUploading={uploadStates.banner.isUploading}
          uploadError={uploadStates.banner.error}
          error={formErrors.banner_image}
          maxSize={10}
          disabled={submissionState.isSubmitting}
        />
      </div>

      {/* Content Editor */}
      <div>
        <label className='mb-2 block font-bold text-gray-700'>Contenido del relato *</label>
        <div
          className={`border-foreground border-2 py-8 ${
            formErrors.content ? 'border-red-500 bg-red-50' : ''
          }`}
        >
          <BlockNoteView
            editor={editor}
            theme={storedTheme === 'dark' ? 'dark' : 'light'}
            editable={!submissionState.isSubmitting}
          />
        </div>
        {formErrors.content && <p className='mt-1 text-sm text-red-600'>{formErrors.content}</p>}
      </div>

      {/* Submit Button */}
      <div className='flex items-center justify-center'>
        <button
          type='submit'
          disabled={submissionState.isSubmitting || uploadStates.isAnyUploading}
          className={`mt-4 scale-110 border-2 px-6 py-3 font-medium transition-all ${
            submissionState.isSubmitting || uploadStates.isAnyUploading
              ? 'cursor-not-allowed border-gray-400 bg-gray-300 text-gray-500'
              : 'bg-secondary border-primary text-primary hover:bg-primary hover:text-secondary'
          } `}
        >
          {submissionState.isSubmitting
            ? 'Enviando...'
            : uploadStates.isAnyUploading
              ? 'Subiendo imágenes...'
              : 'Enviar Formulario'}
        </button>
      </div>

      {/* Submission Progress */}
      {submissionState.isSubmitting && (
        <div className='mt-4'>
          <ProgressIndicator progress={75} isUploading={true} showPercentage={false} />
          <p className='mt-2 text-center text-sm text-gray-600'>Procesando tu relato...</p>
        </div>
      )}
    </form>
  )
}

export default EnhancedRelatoForm
