import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QuerySnapshot
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes, type UploadResult } from 'firebase/storage'

import type {
  CreatePortalMemoriaData,
  CreateRelatoData,
  FirebaseError,
  PortalMemoriaDocument,
  RelatoDocument
} from '../types/firebase.types'
import { getFirebaseFirestore, getFirebaseStorage } from './firebase.config'
import { smartCompressImage, validateImageFile } from './image-processing'

/**
 * Core Firebase service class for handling all Firebase operations
 */
export class FirebaseService {
  private firestore = getFirebaseFirestore()
  private storage = getFirebaseStorage()

  // Collection names
  private readonly COLLECTIONS = {
    RELATOS: 'relatos',
    PORTAL_MEMORIA: 'portal-memoria'
  } as const

  // Storage paths
  private readonly STORAGE_PATHS = {
    RELATOS_DNI: 'relatos/dni',
    RELATOS_BANNERS: 'relatos/banners',
    PORTAL_MEMORIA_DNI: 'portal-memoria/dni',
    PORTAL_MEMORIA_IMAGES: 'portal-memoria/images'
  } as const

  /**
   * Generate unique filename for uploads
   */
  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    return `${timestamp}_${randomId}.${extension}`
  }

  /**
   * Handle Firebase errors and convert to user-friendly messages
   */
  private handleFirebaseError(error: any): FirebaseError {
    console.error('Firebase error:', error)

    const firebaseError: FirebaseError = {
      code: error.code || 'unknown',
      message: error.message || 'Error desconocido',
      originalError: error
    }

    // Map Firebase error codes to Spanish messages
    switch (error.code) {
      case 'permission-denied':
        firebaseError.userMessage = 'No tienes permisos para realizar esta acción'
        break
      case 'unavailable':
        firebaseError.userMessage = 'Servicio temporalmente no disponible. Intenta más tarde.'
        break
      case 'quota-exceeded':
        firebaseError.userMessage = 'Se ha excedido la cuota de almacenamiento'
        break
      case 'unauthenticated':
        firebaseError.userMessage = 'Debes iniciar sesión para continuar'
        break
      default:
        firebaseError.userMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
    }

    return firebaseError
  }

  /**
   * Upload image to Firebase Storage with compression
   */
  async uploadImage(file: File, storagePath: string, maxSizeMB: number = 10): Promise<string> {
    try {
      // Validate file
      const validation = validateImageFile(file, maxSizeMB)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Compress image if needed
      const processedFile = await smartCompressImage(file, {
        maxWidth: storagePath.includes('dni') ? 1200 : 1920,
        maxHeight: storagePath.includes('dni') ? 1200 : 1080,
        quality: 0.8,
        maxSizeMB: maxSizeMB * 0.8 // Leave some buffer
      })

      const fileName = this.generateUniqueFileName(processedFile.name)
      const storageRef = ref(this.storage, `${storagePath}/${fileName}`)

      const uploadResult: UploadResult = await uploadBytes(storageRef, processedFile)
      const downloadURL = await getDownloadURL(uploadResult.ref)

      return downloadURL
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Upload DNI image
   */
  async uploadDniImage(file: File, type: 'relatos' | 'portal-memoria'): Promise<string> {
    const storagePath =
      type === 'relatos' ? this.STORAGE_PATHS.RELATOS_DNI : this.STORAGE_PATHS.PORTAL_MEMORIA_DNI

    return this.uploadImage(file, storagePath, 5) // 5MB limit for DNI images
  }

  /**
   * Upload banner image for relatos
   */
  async uploadBannerImage(file: File): Promise<string> {
    return this.uploadImage(file, this.STORAGE_PATHS.RELATOS_BANNERS, 10) // 10MB limit for banner images
  }

  /**
   * Upload image for portal memoria
   */
  async uploadPortalMemoriaImage(file: File): Promise<string> {
    return this.uploadImage(file, this.STORAGE_PATHS.PORTAL_MEMORIA_IMAGES, 10) // 10MB limit for portal memoria images
  }

  /**
   * Create a new relato document
   */
  async createRelato(data: CreateRelatoData): Promise<string> {
    try {
      const now = Timestamp.now()
      const relatoData: Omit<RelatoDocument, 'id'> = {
        ...data,
        status: 'pending',
        created_at: now,
        updated_at: now
      }

      console.log(relatoData)
      const docRef = await addDoc(collection(this.firestore, this.COLLECTIONS.RELATOS), relatoData)

      return docRef.id
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Create a new portal memoria document
   */
  async createPortalMemoria(data: CreatePortalMemoriaData): Promise<string> {
    try {
      const now = Timestamp.now()
      const portalMemoriaData: Omit<PortalMemoriaDocument, 'id'> = {
        ...data,
        status: 'pending',
        created_at: now,
        updated_at: now,
        metadata: {
          ip_address: '',
          user_agent: navigator.userAgent,
          submission_source: 'web_form'
        }
      }

      const docRef = await addDoc(
        collection(this.firestore, this.COLLECTIONS.PORTAL_MEMORIA),
        portalMemoriaData
      )

      return docRef.id
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Get pending submissions for admin review
   */
  async getPendingSubmissions(type: 'relatos' | 'portal-memoria'): Promise<DocumentData[]> {
    try {
      const collectionName =
        type === 'relatos' ? this.COLLECTIONS.RELATOS : this.COLLECTIONS.PORTAL_MEMORIA

      const q = query(
        collection(this.firestore, collectionName),
        where('status', '==', 'pending'),
        orderBy('created_at', 'desc')
      )

      const querySnapshot: QuerySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Approve a submission
   */
  async approveSubmission(
    id: string,
    type: 'relatos' | 'portal-memoria',
    adminId: string
  ): Promise<void> {
    try {
      const collectionName =
        type === 'relatos' ? this.COLLECTIONS.RELATOS : this.COLLECTIONS.PORTAL_MEMORIA

      const docRef = doc(this.firestore, collectionName, id)
      await updateDoc(docRef, {
        status: 'approved',
        approved_at: Timestamp.now(),
        approved_by: adminId,
        updated_at: Timestamp.now()
      })
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Reject a submission
   */
  async rejectSubmission(
    id: string,
    type: 'relatos' | 'portal-memoria',
    adminId: string,
    notes: string
  ): Promise<void> {
    try {
      const collectionName =
        type === 'relatos' ? this.COLLECTIONS.RELATOS : this.COLLECTIONS.PORTAL_MEMORIA

      const docRef = doc(this.firestore, collectionName, id)
      await updateDoc(docRef, {
        status: 'rejected',
        admin_notes: notes,
        approved_by: adminId,
        updated_at: Timestamp.now()
      })
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Get approved relatos for public display
   */
  async getApprovedRelatos(limitCount?: number): Promise<RelatoDocument[]> {
    try {
      let q = query(
        collection(this.firestore, this.COLLECTIONS.RELATOS),
        where('status', '==', 'approved'),
        orderBy('created_at', 'desc')
      )

      if (limitCount) {
        q = query(q, limit(limitCount))
      }

      const querySnapshot: QuerySnapshot = await getDocs(q)
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data()
          }) as RelatoDocument
      )
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Get approved portal memoria entries for public display
   */
  async getApprovedPortalMemoria(limitCount?: number): Promise<PortalMemoriaDocument[]> {
    try {
      let q = query(
        collection(this.firestore, this.COLLECTIONS.PORTAL_MEMORIA),
        where('status', '==', 'approved'),
        orderBy('created_at', 'desc')
      )

      if (limitCount) {
        q = query(q, limit(limitCount))
      }

      const querySnapshot: QuerySnapshot = await getDocs(q)
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data()
          }) as PortalMemoriaDocument
      )
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Get a single relato by ID
   */
  async getRelatoById(id: string): Promise<RelatoDocument | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.RELATOS, id)
      const docSnap: DocumentSnapshot = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as RelatoDocument
      }

      return null
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }

  /**
   * Get a single portal memoria entry by ID
   */
  async getPortalMemoriaById(id: string): Promise<PortalMemoriaDocument | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.PORTAL_MEMORIA, id)
      const docSnap: DocumentSnapshot = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as PortalMemoriaDocument
      }

      return null
    } catch (error) {
      throw this.handleFirebaseError(error)
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService()
