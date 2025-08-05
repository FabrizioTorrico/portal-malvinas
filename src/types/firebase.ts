import type { Timestamp } from 'firebase/firestore'

// Base document interface
export interface BaseDocument {
  id: string
  created_at: Timestamp
  updated_at: Timestamp
  status: 'pending' | 'approved' | 'rejected'
  approved_at?: Timestamp
  approved_by?: string
  admin_notes?: string
  metadata: {
    ip_address?: string
    user_agent?: string
    submission_source: 'web_form' | 'admin_upload'
  }
}

// Relato document interface
export interface RelatoDocument extends BaseDocument {
  name: string
  surname: string
  phone: string
  title: string
  content: string // Markdown from BlockNote
  dni_image_url: string
  banner_image_url: string
}

// Portal Memoria document interface
export interface PortalMemoriaDocument extends BaseDocument {
  name: string
  surname: string
  phone: string
  description: string
  dni_image_url: string
  image_url: string
}

// Form data interfaces
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

// Create data interfaces (for submission)
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

// Upload progress interface
export interface UploadProgress {
  bytesTransferred: number
  totalBytes: number
  percentage: number
}

// Error interfaces
export interface FirebaseError {
  code: string
  message: string
  details?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Collection names
export const COLLECTIONS = {
  RELATOS: 'relatos',
  PORTAL_MEMORIA: 'portal-memoria'
} as const

// Storage paths
export const STORAGE_PATHS = {
  RELATOS: {
    DNI: 'relatos/dni',
    BANNERS: 'relatos/banners'
  },
  PORTAL_MEMORIA: {
    DNI: 'portal-memoria/dni',
    IMAGES: 'portal-memoria/images'
  },
  ADMIN_UPLOADS: {
    RELATOS: 'admin_uploads/relatos',
    PORTAL_MEMORIA: 'admin_uploads/portal-memoria'
  }
} as const