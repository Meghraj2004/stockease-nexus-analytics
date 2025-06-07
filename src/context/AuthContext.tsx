
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  uid: string;
  email: string | null;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const updateAdminSession = async (userId: string) => {
    try {
      await setDoc(doc(db, "system", "adminSession"), {
        adminId: userId,
        lastActivity: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error("Error updating admin session:", error);
    }
  };

  const clearAdminSession = async (userId: string) => {
    try {
      const sessionDoc = await getDoc(doc(db, "system", "adminSession"));
      if (sessionDoc.exists() && sessionDoc.data().adminId === userId) {
        await deleteDoc(doc(db, "system", "adminSession"));
      }
    } catch (error) {
      console.error("Error clearing admin session:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            const userRole = data.role || 'employee';
            
            setUserData({
              uid: user.uid,
              email: user.email,
              role: userRole,
            });

            // Update admin session if user is admin
            if (userRole === 'admin') {
              await updateAdminSession(user.uid);
            }
          } else {
            console.error('No user data found in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load user data',
            variant: 'destructive',
          });
        }
      } else {
        // Clear admin session if user logs out and was admin
        if (userData?.role === 'admin') {
          await clearAdminSession(userData.uid);
        }
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    // Set up periodic admin session updates
    let sessionInterval: NodeJS.Timeout;
    if (userData?.role === 'admin') {
      sessionInterval = setInterval(() => {
        updateAdminSession(userData.uid);
      }, 5 * 60 * 1000); // Update every 5 minutes
    }

    return () => {
      unsubscribe();
      if (sessionInterval) {
        clearInterval(sessionInterval);
      }
    };
  }, [toast, userData?.role, userData?.uid]);

  const value = {
    currentUser,
    userData,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
