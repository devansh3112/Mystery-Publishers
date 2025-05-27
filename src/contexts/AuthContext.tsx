import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type UserRole = "writer" | "editor" | "publisher";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  balance?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setDemoUser: (role: UserRole) => void;
  updateUserBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }

    if (profile) {
      setUser({
        id: profile.id,
        name: profile.name,
        email: authUser.email!,
        role: profile.role as UserRole,
        avatar: profile.avatar_url,
        balance: profile.balance
      });
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = "writer") => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
  };

  // Demo mode functions
  const setDemoUser = (role: UserRole) => {
    const demoUsers = {
      writer: {
        id: "w1",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        role: "writer" as const,
        avatar: "https://i.pravatar.cc/150?img=32",
        balance: 1250.00
      },
      editor: {
        id: "e1",
        name: "Mark Davis",
        email: "mark@example.com",
        role: "editor" as const,
        avatar: "https://i.pravatar.cc/150?img=61",
        balance: 2450.75
      },
      publisher: {
        id: "a1",
        name: "Priya Sharma",
        email: "priya@example.com",
        role: "publisher" as const,
        avatar: "https://i.pravatar.cc/150?img=48",
        balance: 5000.00
      }
    };

    setUser(demoUsers[role]);
  };

  const updateUserBalance = async (amount: number) => {
    if (!user) return;

    const newBalance = (user.balance || 0) + amount;
    
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    setUser(prev => prev ? {
      ...prev,
      balance: newBalance
    } : null);
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        setDemoUser,
        updateUserBalance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};