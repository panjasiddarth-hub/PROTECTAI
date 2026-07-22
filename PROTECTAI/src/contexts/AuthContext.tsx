import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  name: string;
  email: string;
  role: string;
  organization: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

const STORAGE_KEY = 'protectai.session';

// Demo session model: any non-empty email/password creates a session. This
// keeps the UI flow realistic without standing up the production identity
// layer — the architecture is in place to drop in Supabase Auth or SSO later.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Please enter your email and password.');
    }
    // Simulate a brief handshake for realism.
    await new Promise((r) => setTimeout(r, 350));
    const profile: User = {
      name: deriveName(email),
      email,
      role: 'Safety Operations Lead',
      organization: 'Protect AI Demo Refinery',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function deriveName(email: string): string {
  const local = email.split('@')[0] || 'Operator';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export function useAuth() {
  return useContext(AuthContext);
}