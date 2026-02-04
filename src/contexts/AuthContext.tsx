import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ensureFirebase, isFirebaseReady } from '../firebase/config';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      // Ensure Firebase is initialized if configured
      await ensureFirebase();
      
      const useFirebase = isFirebaseReady();

      if (useFirebase) {
        // Firebase Auth mode
        try {
          const firebaseAuth = await import('firebase/auth');
          const { auth } = await import('../firebase/config');
          const authInstance = auth();
          
          if (authInstance) {
            const unsubscribe = firebaseAuth.onAuthStateChanged(authInstance, async (fbUser: any) => {
              setFirebaseUser(fbUser);
              
              if (fbUser) {
                setUser({
                  id: fbUser.uid,
                  email: fbUser.email || '',
                  name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                });
              } else {
                setUser(null);
              }
              
              setLoading(false);
            });

            return () => unsubscribe();
          }
        } catch (error) {
          console.warn('Firebase Auth not available, using mock:', error);
        }
      }
      
      // Mock mode - auto login for development
      setUser({
        id: 'user-1',
        email: 'sebas@investia.capital',
        name: 'Sebastián',
      });
      setLoading(false);
    };

    setupAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    await ensureFirebase();
    const useFirebase = isFirebaseReady();

    if (useFirebase) {
      try {
        const firebaseAuth = await import('firebase/auth');
        const { auth } = await import('../firebase/config');
        const authInstance = auth();
        
        if (authInstance) {
          await firebaseAuth.signInWithEmailAndPassword(authInstance, email, password);
          return;
        }
      } catch (error: any) {
        throw new Error(error.message || 'Failed to login');
      }
    }
    
    // Mock login
    setUser({
      id: 'user-1',
      email,
      name: email.split('@')[0],
    });
  };

  const loginWithGoogle = async (): Promise<void> => {
    await ensureFirebase();
    const useFirebase = isFirebaseReady();

    if (useFirebase) {
      try {
        const firebaseAuth = await import('firebase/auth');
        const { auth } = await import('../firebase/config');
        const authInstance = auth();
        
        if (authInstance) {
          const provider = new firebaseAuth.GoogleAuthProvider();
          await firebaseAuth.signInWithPopup(authInstance, provider);
          return;
        }
      } catch (error: any) {
        throw new Error(error.message || 'Failed to login with Google');
      }
    }
    
    // Mock Google login
    setUser({
      id: 'user-1',
      email: 'user@gmail.com',
      name: 'Google User',
    });
  };

  const signup = async (email: string, password: string, name: string): Promise<void> => {
    await ensureFirebase();
    const useFirebase = isFirebaseReady();

    if (useFirebase) {
      try {
        const firebaseAuth = await import('firebase/auth');
        const { auth } = await import('../firebase/config');
        const authInstance = auth();
        
        if (authInstance) {
          const userCredential = await firebaseAuth.createUserWithEmailAndPassword(authInstance, email, password);
          // Update display name if possible
          if (userCredential.user && firebaseAuth.updateProfile) {
            await firebaseAuth.updateProfile(userCredential.user, { displayName: name });
          }
          return;
        }
      } catch (error: any) {
        throw new Error(error.message || 'Failed to sign up');
      }
    }
    
    // Mock signup
    setUser({
      id: 'user-1',
      email,
      name,
    });
  };

  const logout = async (): Promise<void> => {
    await ensureFirebase();
    const useFirebase = isFirebaseReady();

    if (useFirebase) {
      try {
        const firebaseAuth = await import('firebase/auth');
        const { auth } = await import('../firebase/config');
        const authInstance = auth();
        
        if (authInstance) {
          await firebaseAuth.signOut(authInstance);
          return;
        }
      } catch (error: any) {
        throw new Error(error.message || 'Failed to logout');
      }
    }
    
    // Mock logout
    setUser(null);
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        login,
        loginWithGoogle,
        signup,
        logout,
        isAuthenticated: !!user,
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
