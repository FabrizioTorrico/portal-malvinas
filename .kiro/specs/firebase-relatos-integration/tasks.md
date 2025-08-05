# Implementation Plan

- [x] 1. Set up Firebase configuration and project structure

  - Install Firebase SDK dependencies (@firebase/app, @firebase/firestore, @firebase/storage, @firebase/auth)
  - Create Firebase configuration file with environment variables
  - Initialize Firebase services (Firestore, Storage, Auth)
  - Set up Firebase emulators for local development
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement Firebase service layer

- [x] 2.1 Create core Firebase service interface and utilities

  - Define TypeScript interfaces for all Firebase operations
  - Implement Firebase service class with connection management
  - Create error handling utilities for Firebase operations
  - Write unit tests for Firebase service utilities
  - _Requirements: 1.1, 6.1, 6.2_

- [x] 2.2 Implement image upload service

  - Create image validation functions (file type, size, format)
  - Implement image compression utility using canvas API
  - Write Firebase Storage upload methods with progress tracking
  - Create unique filename generation utility
  - Write unit tests for image upload functionality
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.1_

- [x] 2.3 Implement Firestore document operations

  - Create relato document creation methods
  - Create portal memoria document creation methods
  - Implement document validation using Zod schemas
  - Write query methods for approved content
  - Write unit tests for Firestore operations
  - _Requirements: 1.2, 1.3, 1.4, 3.4, 3.5_

- [x] 3. Create data models and validation schemas

- [x] 3.1 Define TypeScript interfaces for all data models

  - Create RelatoDocument and PortalMemoriaDocument interfaces
  - Define form data interfaces and validation types
  - Create error handling interfaces
  - Write type guards for runtime type checking
  - _Requirements: 1.2, 1.3, 6.3_

- [x] 3.2 Implement Zod validation schemas

  - Create RelatoSubmissionSchema with all field validations
  - Create PortalMemoriaSubmissionSchema with image array validation
  - Implement custom validation rules for phone numbers and content length
  - Create validation error message mapping in Spanish
  - Write unit tests for all validation schemas
  - _Requirements: 3.1, 3.2, 3.3, 6.4_

- [x] 4. Enhance RelatoForm component with Firebase integration

- [x] 4.1 Add Firebase upload functionality to RelatoForm

  - Integrate image upload service into form component
  - Add upload progress indicators for DNI and banner images
  - Implement form state management for upload status
  - Add loading states and disable form during submission
  - _Requirements: 2.6, 7.3, 7.4, 8.3_

- [x] 4.2 Implement form submission with Firestore integration

  - Connect form submission to Firebase service layer
  - Add form validation before submission
  - Implement error handling with Spanish error messages
  - Add success feedback and form reset functionality
  - Write component tests for form submission flow
  - _Requirements: 3.4, 3.5, 3.6, 6.1, 6.4, 7.1, 7.5_

- [x] 5. Create admin panel components for content management
- [x] 5.1 Build admin authentication system

  - Implement Firebase Auth integration for admin users
  - Create admin login component with form validation
  - Add authentication state management
  - Implement protected route wrapper for admin pages
  - Write tests for authentication flow
  - _Requirements: 4.1, 4.6_

- [x] 5.2 Create pending submissions dashboard

  - Build component to display pending relatos and portal memoria entries
  - Add filtering and sorting functionality for submissions
  - Implement pagination for large submission lists
  - Create submission detail view with image preview
  - Write tests for admin dashboard components
  - _Requirements: 4.1, 4.2, 8.4_

- [x] 5.3 Implement approval and rejection functionality

  - Create approve/reject action buttons with confirmation dialogs
  - Add admin notes input for rejection reasons
  - Implement status update operations with optimistic updates
  - Add audit logging for admin actions
  - Write tests for approval workflow
  - _Requirements: 4.3, 4.4, 4.5_

- [ ] 6. Implement Firebase Security Rules
- [] 6.1 Create and deploy Firestore security rules

  - Write security rules for relatos and portal_memoria collections
  - Implement validation functions for document creation
  - Add admin-only read/write permissions
  - Test security rules with Firebase emulator
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [] 6.2 Create and deploy Firebase Storage security rules

  - Write storage rules for image upload permissions
  - Implement file type and size validation in rules
  - Add admin upload permissions for special folders
  - Test storage rules with various file types and sizes
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 7. Create public display components for approved content
- [x] 7.1 Build relatos display component

  - Create component to display approved relatos with images
  - Implement responsive image loading with lazy loading
  - Add pagination for relatos list
  - Create individual relato detail view
  - Write tests for relatos display components
  - _Requirements: 5.4, 8.4_

- [x] 7.2 Build portal memoria gallery component

  - Create gallery component for approved portal memoria entries
  - Implement image grid layout with lightbox functionality
  - Add filtering by person name or date
  - Create individual memorial detail view
  - Write tests for portal memoria gallery
  - _Requirements: 5.4, 8.4_

- [ ] 8. Implement error handling and user feedback systems
- [ ] 8.1 Create comprehensive error handling utilities

  - Implement error classification and recovery strategies
  - Create retry mechanisms for failed operations
  - Add offline detection and fallback behavior
  - Write error logging and monitoring utilities
  - _Requirements: 6.1, 6.2, 6.3, 8.5_

- [ ] 8.2 Add user feedback and notification system

  - Create toast notification component for success/error messages
  - Implement progress indicators for long-running operations
  - Add form validation feedback with Spanish messages
  - Create loading states for all async operations
  - Write tests for user feedback components
  - _Requirements: 6.4, 6.5, 7.3, 7.4_

- [ ] 9. Add performance optimizations
- [x] 9.1 Implement image optimization and caching

  - Add client-side image compression before upload
  - Implement progressive image loading
  - Add browser caching headers for images
  - Create thumbnail generation for admin previews
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 9.2 Optimize Firestore queries and caching

  - Add composite indexes for admin queries
  - Implement query pagination for large datasets
  - Add offline persistence for admin panel
  - Create caching strategy for frequently accessed data
  - Write performance tests for query optimization
  - _Requirements: 8.3, 8.4, 8.5_

- [ ] 10. Create comprehensive test suite
- [ ] 10.1 Write unit tests for all Firebase services

  - Test all Firebase service methods with mocked SDK
  - Test image upload and validation functions
  - Test Firestore document operations
  - Test error handling and recovery mechanisms
  - _Requirements: All requirements_

- [ ] 10.2 Write integration tests for complete workflows

  - Test end-to-end form submission flow
  - Test admin approval/rejection workflow
  - Test public content display functionality
  - Test Firebase security rules with emulator
  - _Requirements: All requirements_

- [ ] 11. Deploy and configure production Firebase environment
- [ ] 11.1 Set up production Firebase project

  - Create production Firebase project with proper configuration
  - Deploy Firestore and Storage security rules
  - Configure Firebase hosting for admin panel
  - Set up monitoring and alerting for production
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 11.2 Configure environment variables and deployment
  - Set up environment-specific Firebase configuration
  - Configure Vercel deployment with Firebase environment variables
  - Test production deployment with staging data
  - Create deployment documentation and runbook
  - _Requirements: All requirements_
