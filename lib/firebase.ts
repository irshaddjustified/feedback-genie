import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";
//test
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// Enhanced user type for role-based access
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'super_admin' | 'admin' | 'owner' | 'user';
  organizationId?: string;
  organizationDomain?: string;
  permissions: string[];
  isAnonymous: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
}

// Define permissions inline to avoid circular imports
const DEFAULT_PERMISSIONS = {
  super_admin: [
    'manage_system',
    'manage_organizations',
    'manage_admins',
    'manage_users',
    'manage_surveys',
    'create_surveys',
    'edit_surveys',
    'delete_surveys',
    'view_surveys',
    'publish_surveys',
    'view_responses',
    'delete_responses',
    'view_analytics',
    'export_data',
    'send_invites',
    'manage_clients',
    'view_clients',
    'manage_projects',
    'view_projects'
  ],
  admin: [
    'manage_organization',
    'manage_users',
    'manage_surveys',
    'create_surveys',
    'edit_surveys',
    'delete_surveys',
    'view_surveys',
    'publish_surveys',
    'view_responses',
    'view_analytics',
    'export_data',
    'send_invites',
    'manage_clients',
    'view_clients',
    'manage_projects',
    'view_projects'
  ],
  owner: [
    'create_surveys',
    'edit_surveys',
    'view_surveys',
    'publish_surveys',
    'view_responses',
    'view_analytics',
    'export_data',
    'view_clients',
    'view_projects'
  ],
  user: [
    'view_surveys',
    'submit_responses'
  ]
};

// Demo credentials for easy access
export const DEMO_CREDENTIALS = {
  super_admin: {
    email: 'demo@insighture.com',
    password: 'demo123',
    displayName: 'Demo Super Admin'
  },
  admin: {
    email: 'admin@company.com', 
    password: 'admin123',
    displayName: 'Demo Admin'
  },
  owner: {
    email: 'owner@company.com',
    password: 'owner123', 
    displayName: 'Demo Owner'
  }
};

// Convert Firebase user to App user with role detection
// Database helper functions for user management
export const getUserFromDatabase = async (uid: string): Promise<Partial<AppUser> | null> => {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as Partial<AppUser> : null;
  } catch (error) {
    console.error('Error getting user from database:', error);
    return null;
  }
};

export const saveUserToDatabase = async (user: AppUser): Promise<void> => {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', user.uid), {
      ...user,
      lastLoginAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user to database:', error);
  }
};

export const updateUserRole = async (uid: string, role: AppUser['role'], organizationId?: string): Promise<void> => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'users', uid), {
      role,
      organizationId,
      permissions: DEFAULT_PERMISSIONS[role],
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const convertFirebaseUser = async (user: FirebaseUser | null): Promise<AppUser | null> => {
  if (!user) return null;
  
  // Anonymous users have limited permissions
  if (user.isAnonymous) {
    return {
      uid: user.uid,
      email: null,
      displayName: null,
      role: 'user',
      permissions: DEFAULT_PERMISSIONS.user,
      isAnonymous: true
    };
  }
  
  // First check if user exists in our database
  const userData = await getUserFromDatabase(user.uid);
  if (userData && userData.role && userData.permissions) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? userData.displayName ?? null,
      role: userData.role,
      organizationId: userData.organizationId,
      organizationDomain: userData.organizationDomain,
      permissions: userData.permissions,
      isAnonymous: false,
      isEmailVerified: user.emailVerified,
      lastLoginAt: new Date(),
      createdAt: userData.createdAt
    };
  }
  
  // Check for admin credentials and domain-based access
  const email = user.email?.toLowerCase();
  let role: AppUser['role'] = 'user';
  let organizationDomain = '';
  
  // Check for demo credentials
  if (email === DEMO_CREDENTIALS.super_admin.email) {
    role = 'super_admin';
  } else if (email === DEMO_CREDENTIALS.admin.email) {
    role = 'admin';
    organizationDomain = 'company.com';
  } else if (email === DEMO_CREDENTIALS.owner.email) {
    role = 'owner';
    organizationDomain = 'company.com';
  } else if (email === process.env.ADMIN_EMAIL || email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || email === 'admin@insighture.com') {
    role = 'super_admin';
  } else if (email) {
    // Check if email domain is in allowed admin domains
    const emailDomain = email.split('@')[1];
    const adminDomains = process.env.ADMIN_DOMAINS?.split(',').map(d => d.trim()) || ['insighture.com'];
    
    if (adminDomains.includes(emailDomain)) {
      role = 'admin';
      organizationDomain = emailDomain;
    }
  }
  
  // Extract domain from email for organization matching
  if (!organizationDomain && email) {
    organizationDomain = email.split('@')[1];
  }
  
  const appUser: AppUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? null,
    role,
    organizationDomain,
    permissions: DEFAULT_PERMISSIONS[role],
    isAnonymous: false,
    isEmailVerified: user.emailVerified,
    lastLoginAt: new Date(),
    createdAt: new Date()
  };
  
  // Save new user to database
  await saveUserToDatabase(appUser);
  
  return appUser;
};

// Authentication service
export const authService = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string) {
    try {
      console.log('Attempting login with:', { email: email.toLowerCase().trim() });
      
      // Check for hardcoded super admin credentials first
      const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@insighture.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (email.toLowerCase().trim() === adminEmail.toLowerCase().trim() && password === adminPassword) {
        console.log('Hardcoded admin credentials matched, creating super admin user');
        
        // Return super admin user object
        const superAdminUser = {
          uid: 'super-admin-uid',
          email: adminEmail,
          displayName: 'Super Admin',
          role: 'super_admin' as const,
          organizationDomain: 'insighture.com',
          permissions: [...DEFAULT_PERMISSIONS.super_admin],
          isAnonymous: false,
          isEmailVerified: true,
          lastLoginAt: new Date(),
          createdAt: new Date()
        };
        
        console.log('Created super admin user:', superAdminUser);
        return superAdminUser;
      }
      
      // Check for demo credentials
      if (email.toLowerCase().trim() === DEMO_CREDENTIALS.super_admin.email && password === DEMO_CREDENTIALS.super_admin.password) {
        console.log('Demo super admin credentials matched');
        return {
          uid: 'demo-super-admin-uid',
          email: DEMO_CREDENTIALS.super_admin.email,
          displayName: DEMO_CREDENTIALS.super_admin.displayName,
          role: 'super_admin' as const,
          organizationDomain: 'insighture.com',
          permissions: [...DEFAULT_PERMISSIONS.super_admin],
          isAnonymous: false,
          isEmailVerified: true,
          lastLoginAt: new Date(),
          createdAt: new Date()
        };
      }
      
      if (email.toLowerCase().trim() === DEMO_CREDENTIALS.admin.email && password === DEMO_CREDENTIALS.admin.password) {
        console.log('Demo admin credentials matched');
        return {
          uid: 'demo-admin-uid',
          email: DEMO_CREDENTIALS.admin.email,
          displayName: DEMO_CREDENTIALS.admin.displayName,
          role: 'admin' as const,
          organizationDomain: 'company.com',
          permissions: [...DEFAULT_PERMISSIONS.admin],
          isAnonymous: false,
          isEmailVerified: true,
          lastLoginAt: new Date(),
          createdAt: new Date()
        };
      }
      
      if (email.toLowerCase().trim() === DEMO_CREDENTIALS.owner.email && password === DEMO_CREDENTIALS.owner.password) {
        console.log('Demo owner credentials matched');
        return {
          uid: 'demo-owner-uid',
          email: DEMO_CREDENTIALS.owner.email,
          displayName: DEMO_CREDENTIALS.owner.displayName,
          role: 'owner' as const,
          organizationDomain: 'company.com',
          permissions: [...DEFAULT_PERMISSIONS.owner],
          isAnonymous: false,
          isEmailVerified: true,
          lastLoginAt: new Date(),
          createdAt: new Date()
        };
      }
      
      console.log('No hardcoded credentials matched, trying Firebase authentication');
      // Otherwise try Firebase authentication  
      const result = await signInWithEmailAndPassword(auth, email, password);
      return await convertFirebaseUser(result.user);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await convertFirebaseUser(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  },

  // Sign in anonymously
  async signInAnonymously() {
    try {
      const result = await signInAnonymously(auth);
      return await convertFirebaseUser(result.user);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  },

  // Create account with email and password
  async createAccount(email: string, password: string, displayName?: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      return await convertFirebaseUser(result.user);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    return await convertFirebaseUser(auth.currentUser);
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: AppUser | null) => void) {
    return onAuthStateChanged(auth, async (user) => {
      const appUser = await convertFirebaseUser(user);
      callback(appUser);
    });
  },
  
  // Permission checking helper
  hasPermission(user: AppUser | null, permission: string): boolean {
    return user?.permissions?.includes(permission) || false;
  },
  
  // Role checking helpers
  isSuperAdmin(user: AppUser | null): boolean {
    return user?.role === 'super_admin';
  },
  
  isAdmin(user: AppUser | null): boolean {
    return user?.role === 'admin' || user?.role === 'super_admin';
  },
  
  isOwner(user: AppUser | null): boolean {
    return user?.role === 'owner' || user?.role === 'admin' || user?.role === 'super_admin';
  }
};

// Legacy helpers for backward compatibility
export const authHelpers = {
  signInWithGoogle: authService.signInWithGoogle,
  signInAnonymously: authService.signInAnonymously,
  signOut: authService.signOut,
  getCurrentUser: authService.getCurrentUser,
  hasPermission: authService.hasPermission,
  isSuperAdmin: authService.isSuperAdmin,
  isAdmin: authService.isAdmin,
  isOwner: authService.isOwner
};

export { auth, googleProvider as provider, db };
