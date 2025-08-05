import { z } from 'zod'

import { ERROR_MESSAGES } from './firebase.errors'

// Phone number regex for Argentina (10-15 digits)
const PHONE_REGEX = /^[0-9]{10,15}$/

// Custom error messages in Spanish
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === 'string') {
        return { message: 'Este campo es obligatorio.' }
      }
      break
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: `Debe tener al menos ${issue.minimum} caracteres.` }
      }
      break
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `No puede tener más de ${issue.maximum} caracteres.` }
      }
      break
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'regex') {
        return { message: 'Formato inválido.' }
      }
      break
  }
  return { message: ctx.defaultError }
}

// Set custom error map
z.setErrorMap(customErrorMap)

// Base person schema (common fields)
const BasePersonSchema = z.object({
  name: z
    .string()
    .min(2, ERROR_MESSAGES['name-too-short'])
    .max(50, 'El nombre no puede tener más de 50 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios.'),

  surname: z
    .string()
    .min(2, ERROR_MESSAGES['name-too-short'])
    .max(50, 'El apellido no puede tener más de 50 caracteres.')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios.'),

  phone: z
    .string()
    .regex(PHONE_REGEX, ERROR_MESSAGES['invalid-phone'])
    .transform((val) => val.replace(/\s+/g, '')) // Remove spaces
})

// File validation schema
const ImageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'No se ha seleccionado ningún archivo.')
  .refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
    'Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y WebP.'
  )

// DNI image validation (5MB max)
const DniImageSchema = ImageFileSchema.refine(
  (file) => file.size <= 5 * 1024 * 1024,
  'La imagen del DNI no puede superar los 5MB.'
)

// Banner image validation (10MB max)
const BannerImageSchema = ImageFileSchema.refine(
  (file) => file.size <= 10 * 1024 * 1024,
  'La imagen banner no puede superar los 10MB.'
)

// Portal memoria image validation (10MB max)
const PortalMemoriaImageSchema = ImageFileSchema.refine(
  (file) => file.size <= 10 * 1024 * 1024,
  'La imagen no puede superar los 10MB.'
)

// Relato submission schema
export const RelatoSubmissionSchema = BasePersonSchema.extend({
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres.')
    .max(100, 'El título no puede tener más de 100 caracteres.'),

  content: z
    .string()
    .min(50, 'El contenido debe tener al menos 50 caracteres.')
    .max(10000, 'El contenido no puede tener más de 10,000 caracteres.'),

  dni_image: DniImageSchema,
  banner_image: BannerImageSchema
})

// Portal memoria submission schema
export const PortalMemoriaSubmissionSchema = BasePersonSchema.extend({
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres.')
    .max(1000, 'La descripción no puede tener más de 1,000 caracteres.'),

  dni_image: DniImageSchema,
  image: PortalMemoriaImageSchema
})

// Create data schemas (for Firebase documents)
export const CreateRelatoDataSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  phone: z.string().regex(PHONE_REGEX),
  title: z.string().min(1),
  content: z.string().min(1),
  dni_image_url: z.string().url('URL de imagen DNI inválida.'),
  banner_image_url: z.string().url('URL de imagen banner inválida.')
})

export const CreatePortalMemoriaDataSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  phone: z.string().regex(PHONE_REGEX),
  description: z.string().min(1),
  dni_image_url: z.string().url('URL de imagen DNI inválida.'),
  image_url: z.string().url('URL de imagen inválida.')
})

// Admin update schemas
export const AdminUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  admin_notes: z.string().optional(),
  approved_by: z.string().optional()
})

// Query parameter schemas
export const GetSubmissionsQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
})

// Form validation helpers
export type RelatoSubmissionData = z.infer<typeof RelatoSubmissionSchema>
export type PortalMemoriaSubmissionData = z.infer<typeof PortalMemoriaSubmissionSchema>
export type CreateRelatoData = z.infer<typeof CreateRelatoDataSchema>
export type CreatePortalMemoriaData = z.infer<typeof CreatePortalMemoriaDataSchema>

/**
 * Validate relato form data
 */
export const validateRelatoSubmission = (data: unknown) => {
  return RelatoSubmissionSchema.safeParse(data)
}

/**
 * Validate portal memoria form data
 */
export const validatePortalMemoriaSubmission = (data: unknown) => {
  return PortalMemoriaSubmissionSchema.safeParse(data)
}

/**
 * Validate create relato data
 */
export const validateCreateRelatoData = (data: unknown) => {
  return CreateRelatoDataSchema.safeParse(data)
}

/**
 * Validate create portal memoria data
 */
export const validateCreatePortalMemoriaData = (data: unknown) => {
  return CreatePortalMemoriaDataSchema.safeParse(data)
}

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {}

  errors.errors.forEach((error) => {
    const field = error.path.join('.')
    formattedErrors[field] = error.message
  })

  return formattedErrors
}

/**
 * Get field-specific error message
 */
export const getFieldError = (errors: z.ZodError, fieldName: string): string | undefined => {
  const fieldError = errors.errors.find(
    (error) => error.path.length === 1 && error.path[0] === fieldName
  )

  return fieldError?.message
}

/**
 * Check if form has any validation errors
 */
export const hasValidationErrors = (errors: z.ZodError): boolean => {
  return errors.errors.length > 0
}

/**
 * Sanitize string input (remove potentially harmful characters)
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Sanitize phone number (remove non-digits)
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '')
}

/**
 * Validate and sanitize form data before submission
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data } as any

  // Sanitize string fields
  Object.keys(sanitized).forEach((key) => {
    if (typeof sanitized[key] === 'string') {
      if (key === 'phone') {
        sanitized[key] = sanitizePhone(sanitized[key])
      } else {
        sanitized[key] = sanitizeString(sanitized[key])
      }
    }
  })

  return sanitized
}
