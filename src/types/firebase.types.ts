import type { Timestamp } from 'firebase/firestore'

// Base document metadata
export interface DocumentMetadata {
  ip_address?: string
  user_agent?: string
  submission_source: 'web_form' | 'admin_upload'
}

// Relato document interface
export interface RelatoDocument {
  id: string
  name: string
  surname: string
  phone: string
  title: string
  content: string // Markdown from BlockNote
  dni_image_url: string
  banner_image_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: Timestamp
  updated_at: Timestamp
  approved_at?: Timestamp
  approved_by?: string
  admin_notes?: string
}

// Portal Memoria document interface
export interface PortalMemoriaDocument {
  id: string
  name: string
  surname: string
  phone: string
  description: string
  dni_image_url: string
  image_url: string // Single image URL
  status: 'pending' | 'approved' | 'rejected'
  created_at: Timestamp
  updated_at: Timestamp
  approved_at?: Timestamp
  approved_by?: string
  admin_notes?: string
  metadata: DocumentMetadata
}

// Data for creating new documents (without auto-generated fields)
export interface CreateRelatoData {
  name: string
  surname: string
  phone: string
  title: string
  content: string
  dni_image_url: string
  banner_image_url: string
}

export interface CreatePortalMemoriaData {
  name: string
  surname: string
  phone: string
  description: string
  dni_image_url: string
  image_url: string
}

// Form data interfaces (before upload)
export interface RelatoFormData {
  name: string
  surname: string
  phone: string
  title: string
  content: string
  dni_image: File | null
  banner_image: File | null
}

export interface PortalMemoriaFormData {
  name: string
  surname: string
  phone: string
  description: string
  dni_image: File | null
  image: File | null
}

// Error handling
export interface FirebaseError {
  code: string
  message: string
  userMessage?: string
  originalError?: any
}

// Form validation errors
export interface FormErrors {
  name?: string
  surname?: string
  phone?: string
  title?: string
  content?: string
  description?: string
  dni_image?: string
  banner_image?: string
  image?: string
  general?: string
}

// Upload progress tracking
export interface UploadProgress {
  dni_image: number
  banner_image?: number
  image?: number
}

// Form state for React components
export interface FormState {
  isSubmitting: boolean
  isUploading: boolean
  uploadProgress: UploadProgress
  errors: FormErrors
  submitError: string | null
  isSubmitted: boolean
  submissionId: string | null
}

// Admin panel interfaces
export interface PendingSubmission {
  id: string
  type: 'relatos' | 'portal-memoria'
  data: RelatoDocument | PortalMemoriaDocument
}

export interface AdminAction {
  type: 'approve' | 'reject'
  submissionId: string
  submissionType: 'relatos' | 'portal-memoria'
  adminId: string
  notes?: string
}

// Query options
export interface QueryOptions {
  limit?: number
  orderBy?: 'created_at' | 'updated_at'
  orderDirection?: 'asc' | 'desc'
}

// Upload file validation
export interface FileValidation {
  maxSize: number // in bytes
  allowedTypes: string[]
  required: boolean
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: FirebaseError
}

// Constants for validation
export const VALIDATION_CONSTANTS = {
  MAX_DNI_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_BANNER_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PORTAL_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 100,
  MIN_CONTENT_LENGTH: 50,
  MAX_CONTENT_LENGTH: 10000,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000
} as const
