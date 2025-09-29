import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // For development, you can use the Firebase emulator
    // For production, you'll need to set up service account credentials
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project'

    // Check if we have service account credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

    if (serviceAccount) {
      // Production: use service account
      const serviceAccountKey = JSON.parse(serviceAccount)
      initializeApp({
        credential: cert(serviceAccountKey),
        projectId: serviceAccountKey.project_id
      })
    } else {
      // Development: use project ID only (will work with emulator)
      initializeApp({
        projectId
      })
    }
  }

  return getAuth()
}

export const adminAuth = initializeFirebaseAdmin()