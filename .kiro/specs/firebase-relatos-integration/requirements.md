# Requirements Document

## Introduction

This feature integrates Firebase Firestore and Firebase Storage into the Portal Malvinas application to handle relato (story) submissions and portal memoria (memory portal) entries. The system will support two types of users: unauthenticated users who can submit content, and admin users who can approve and manage submissions. Each submission requires specific image validation and DNI verification for combatants.

## Requirements

### Requirement 1: Firebase Schema Design

**User Story:** As a system architect, I want a well-defined Firebase schema for relatos and portal memoria entries, so that data is consistently structured and efficiently queried.

#### Acceptance Criteria

1. WHEN designing the Firestore schema THEN the system SHALL create separate collections for "relatos" and "portal-memoria"
2. WHEN storing relato data THEN the system SHALL include fields for name, surname, phone, title, content, dni_image_url, banner_image_url, status, created_at, updated_at, and admin_notes
3. WHEN storing portal memoria data THEN the system SHALL include fields for name, surname, phone, dni_image_url, image_url, description, status, created_at, updated_at, and admin_notes
4. WHEN defining status field THEN the system SHALL support values: "pending", "approved", "rejected"
5. WHEN storing images THEN the system SHALL organize Firebase Storage with folders: "relatos/dni", "relatos/banners", "portal-memoria/dni", "portal-memoria/images"

### Requirement 2: Image Upload and Validation

**User Story:** As a combatant or family member, I want to upload my DNI image and story banner/gallery images, so that my submission can be verified and displayed properly.

#### Acceptance Criteria

1. WHEN uploading DNI image THEN the system SHALL accept only image files (jpg, png, webp) with maximum size of 5MB
2. WHEN uploading banner image for relatos THEN the system SHALL accept only image files with maximum size of 10MB
3. WHEN uploading image for portal memoria THEN the system SHALL accept one image file with maximum size of 10MB
4. WHEN uploading images THEN the system SHALL generate unique filenames using timestamp and random string
5. WHEN upload fails THEN the system SHALL display appropriate error messages in Spanish
6. WHEN upload succeeds THEN the system SHALL store the download URL in Firestore

### Requirement 3: Unauthenticated User Submission

**User Story:** As an unauthenticated user, I want to submit relatos or portal memoria entries, so that I can share my story or memories without needing to create an account.

#### Acceptance Criteria

1. WHEN submitting a relato THEN the system SHALL require name, surname, phone, title, content, dni_image, and banner_image
2. WHEN submitting portal memoria entry THEN the system SHALL require name, surname, phone, dni_image, and one image
3. WHEN form is submitted THEN the system SHALL validate all required fields are present
4. WHEN validation passes THEN the system SHALL upload images to Firebase Storage
5. WHEN images are uploaded THEN the system SHALL create Firestore document with status "pending"
6. WHEN submission is complete THEN the system SHALL display success message and clear the form

### Requirement 4: Admin User Management

**User Story:** As an admin user, I want to review and approve/reject submissions, so that only verified content appears on the public site.

#### Acceptance Criteria

1. WHEN admin accesses admin panel THEN the system SHALL display pending submissions for both relatos and portal memoria
2. WHEN admin reviews submission THEN the system SHALL show all submitted data including images
3. WHEN admin approves submission THEN the system SHALL update status to "approved" and set approval timestamp
4. WHEN admin rejects submission THEN the system SHALL update status to "rejected" and allow adding rejection notes
5. WHEN admin makes decision THEN the system SHALL log the admin action with timestamp
6. IF admin uploads content directly THEN the system SHALL set status to "approved" automatically

### Requirement 5: Firebase Security Rules

**User Story:** As a system administrator, I want secure Firebase rules, so that data access is properly controlled and unauthorized users cannot modify approved content.

#### Acceptance Criteria

1. WHEN unauthenticated user accesses Firestore THEN the system SHALL allow only create operations on relatos and portal-memoria collections
2. WHEN authenticated admin accesses Firestore THEN the system SHALL allow read, update operations on all documents
3. WHEN accessing Firebase Storage THEN the system SHALL allow unauthenticated users to upload to designated folders only
4. WHEN accessing approved content THEN the system SHALL allow public read access for approved documents only
5. WHEN attempting unauthorized operations THEN the system SHALL deny access and log security events

### Requirement 6: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when something goes wrong, so that I understand what happened and how to fix it.

#### Acceptance Criteria

1. WHEN network error occurs THEN the system SHALL display "Error de conexión. Intenta nuevamente." message
2. WHEN file upload fails THEN the system SHALL display specific error message about file size or format
3. WHEN form validation fails THEN the system SHALL highlight invalid fields with Spanish error messages
4. WHEN submission is successful THEN the system SHALL display "Tu relato ha sido enviado y está pendiente de aprobación"
5. WHEN Firebase quota is exceeded THEN the system SHALL display maintenance message

### Requirement 7: Data Integration with Existing Components

**User Story:** As a developer, I want the Firebase integration to work seamlessly with existing RelatoForm component, so that the user experience remains consistent.

#### Acceptance Criteria

1. WHEN integrating with RelatoForm THEN the system SHALL maintain existing form structure and styling
2. WHEN form is submitted THEN the system SHALL convert BlockNote content to markdown before storing
3. WHEN images are selected THEN the system SHALL show upload progress indicators
4. WHEN submission is in progress THEN the system SHALL disable form controls and show loading state
5. WHEN form is reset THEN the system SHALL clear all file inputs and editor content

### Requirement 8: Performance and Optimization

**User Story:** As a user, I want fast upload and submission times, so that I don't abandon the process due to slow performance.

#### Acceptance Criteria

1. WHEN uploading images THEN the system SHALL compress images client-side if they exceed optimal size
2. WHEN multiple images are uploaded THEN the system SHALL upload them in parallel
3. WHEN form is submitted THEN the system SHALL show progress indicators for each step
4. WHEN using mobile devices THEN the system SHALL optimize image capture and upload process
5. WHEN connection is slow THEN the system SHALL provide retry mechanisms for failed uploads