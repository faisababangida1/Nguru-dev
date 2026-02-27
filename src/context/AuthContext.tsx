import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, isFirebaseConfigured } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../lib/storage';

interface UserProfile {
  wonder: string;
  excitement: string;
  explanationStyle: string;
  dislikes: string;
  ageGroup: string;
  recentConfusion: string;
  isOnboarded: boolean;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  mockSignIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  mockSignIn: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const data = await getUserProfile(uid);
      setProfile(data as UserProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  const mockSignIn = () => {
    const mockUser = { uid: 'mock-user-123', displayName: 'Curious Learner', email: 'demo@nguru.app' };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    setUser(mockUser);
    fetchProfile(mockUser.uid).then(() => setLoading(false));
  };

  const signOut = () => {
    if (isFirebaseConfigured) {
      auth.signOut();
    } else {
      localStorage.removeItem('mock_user');
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.uid);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      const mockUser = localStorage.getItem('mock_user');
      if (mockUser) {
        const parsed = JSON.parse(mockUser);
        setUser(parsed);
        fetchProfile(parsed.uid).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, mockSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
