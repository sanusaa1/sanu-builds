import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { getUserProfile, createUserProfile, updateUserProfile } from '../services/userService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  register: (arg1: string, arg2: string, arg3?: string, arg4?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  loginAsDemoCustomer: () => Promise<void>;
  demoLogin: (role: 'admin' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['admin@sanubuilds.com', 'anritvox@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        let profile = await getUserProfile(user.uid);
        const isEmailAdmin = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

        if (!profile) {
          const newProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Builder',
            email: user.email || '',
            photoURL: user.photoURL || '',
            role: isEmailAdmin ? 'admin' : 'customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await createUserProfile(newProfile);
          profile = newProfile;
        } else if (isEmailAdmin && profile.role !== 'admin') {
          // Sync admin privilege if email matches admin list
          profile.role = 'admin';
          await updateUserProfile(user.uid, { role: 'admin' });
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (name: string, email: string, pass: string, phone?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });

    const isEmailAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const newProfile: UserProfile = {
      uid: user.uid,
      name,
      email,
      phone: phone || '',
      photoURL: user.photoURL || '',
      role: isEmailAdmin ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await createUserProfile(newProfile);
    setUserProfile(newProfile);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    let profile = await getUserProfile(user.uid);
    const isEmailAdmin = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

    if (!profile) {
      const newProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'Builder',
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: isEmailAdmin ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createUserProfile(newProfile);
      setUserProfile(newProfile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    await updateUserProfile(currentUser.uid, data);
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  // One-click demo accounts for seamless evaluation
  const loginAsDemoAdmin = async () => {
    try {
      await login('admin@sanubuilds.com', 'AdminPass123!');
    } catch {
      try {
        await signup('Sanu Admin', 'admin@sanubuilds.com', 'AdminPass123!');
      } catch {
        // Fallback mock profile state if offline/restricted
        setUserProfile({
          uid: 'demo_admin_uid',
          name: 'Sanu Admin',
          email: 'admin@sanubuilds.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  const loginAsDemoCustomer = async () => {
    try {
      await login('alex.customer@sanubuilds.com', 'Customer123!');
    } catch {
      try {
        await signup('Alex Rivers', 'alex.customer@sanubuilds.com', 'Customer123!');
      } catch {
        setUserProfile({
          uid: 'demo_customer_uid',
          name: 'Alex Rivers',
          email: 'alex.customer@sanubuilds.com',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  const isAdmin =
    userProfile?.role === 'admin' ||
    (currentUser?.email ? ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) : false);

  const register = async (arg1: string, arg2: string, arg3?: string, arg4?: string) => {
    if (arg1.includes('@')) {
      // Called as register(email, password, name, phone)
      await signup(arg3 || 'Builder', arg1, arg2, arg4);
    } else {
      // Called as register(name, email, password, phone)
      await signup(arg1, arg2, arg3 || '', arg4);
    }
  };

  const signInWithGoogle = loginWithGoogle;

  const demoLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await loginAsDemoAdmin();
    } else {
      await loginAsDemoCustomer();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        login,
        signup,
        register,
        loginWithGoogle,
        signInWithGoogle,
        logout,
        resetPassword,
        updateUser,
        loginAsDemoAdmin,
        loginAsDemoCustomer,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
