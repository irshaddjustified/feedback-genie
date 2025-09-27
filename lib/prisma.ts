// Database service using Firebase Firestore
// Hierarchy: Organization → Clients → Projects → Surveys → Responses
import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore'

export const database = {
  // Organization (top level - usually one per instance)
  organization: {
    create: async (data: any) => {
      const docRef = await addDoc(collection(db, 'organizations'), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { id: docRef.id, ...data }
    },
    findMany: async () => {
      const snapshot = await getDocs(collection(db, 'organizations'))
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },
    findById: async (id: string) => {
      const docRef = doc(db, 'organizations', id)
      const snapshot = await getDoc(docRef)
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
    },
    update: async (id: string, data: any) => {
      const docRef = doc(db, 'organizations', id)
      await updateDoc(docRef, { ...data, updatedAt: new Date() })
      return { id, ...data }
    }
  },

  // Clients (under organization)
  clients: {
    create: async (data: any) => {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { id: docRef.id, ...data }
    },
    findMany: async (organizationId?: string) => {
      let q
      if (organizationId) {
        q = query(collection(db, 'clients'), where('organizationId', '==', organizationId))
      } else {
        q = collection(db, 'clients')
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },
    findById: async (id: string) => {
      const docRef = doc(db, 'clients', id)
      const snapshot = await getDoc(docRef)
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
    },
    update: async (id: string, data: any) => {
      const docRef = doc(db, 'clients', id)
      await updateDoc(docRef, { ...data, updatedAt: new Date() })
      return { id, ...data }
    },
    delete: async (id: string) => {
      await deleteDoc(doc(db, 'clients', id))
    }
  },

  // Projects (under clients)
  projects: {
    create: async (data: any) => {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { id: docRef.id, ...data }
    },
    findMany: async (clientId?: string) => {
      let q
      if (clientId) {
        q = query(collection(db, 'projects'), where('clientId', '==', clientId))
      } else {
        q = collection(db, 'projects')
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },
    findById: async (id: string) => {
      const docRef = doc(db, 'projects', id)
      const snapshot = await getDoc(docRef)
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
    },
    update: async (id: string, data: any) => {
      const docRef = doc(db, 'projects', id)
      await updateDoc(docRef, { ...data, updatedAt: new Date() })
      return { id, ...data }
    },
    delete: async (id: string) => {
      await deleteDoc(doc(db, 'projects', id))
    }
  },
  
  // Surveys (under projects)
  surveys: {
    create: async (data: any) => {
      const docRef = await addDoc(collection(db, 'surveys'), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { id: docRef.id, ...data }
    },
    findMany: async (projectId?: string) => {
      let q
      if (projectId) {
        q = query(collection(db, 'surveys'), where('projectId', '==', projectId))
      } else {
        q = collection(db, 'surveys')
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },
    findById: async (id: string) => {
      const docRef = doc(db, 'surveys', id)
      const snapshot = await getDoc(docRef)
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
    },
    update: async (id: string, data: any) => {
      const docRef = doc(db, 'surveys', id)
      await updateDoc(docRef, { ...data, updatedAt: new Date() })
      return { id, ...data }
    },
    delete: async (id: string) => {
      await deleteDoc(doc(db, 'surveys', id))
    }
  },
  
  // Responses (under surveys)
  responses: {
    create: async (data: any) => {
      const docRef = await addDoc(collection(db, 'responses'), {
        ...data,
        createdAt: new Date(),
        submittedAt: new Date()
      })
      return { id: docRef.id, ...data }
    },
    findMany: async (surveyId?: string) => {
      let q
      if (surveyId) {
        q = query(collection(db, 'responses'), where('surveyId', '==', surveyId))
      } else {
        q = collection(db, 'responses')
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },
    findById: async (id: string) => {
      const docRef = doc(db, 'responses', id)
      const snapshot = await getDoc(docRef)
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
    }
  }
}

// Export the database service as the default export for easy migration from Prisma
export default database
