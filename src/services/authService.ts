import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'owner';
}

export interface AuthSession {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const OFFLINE_OWNER_KEY = 'veera_offline_owner';
const OFFLINE_SESSION_KEY = 'veera_owner_session';

// Clean up any legacy custom cipher keys
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    localStorage.removeItem('veera_mission_control_vault');
    localStorage.removeItem('veera_mission_control_auth');
  } catch {
    // Ignore storage access errors
  }
}

// Standard SHA-256 hashing for local offline fallback (no custom ciphers)
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(password));
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const authService = {
  // Check if owner account has been created
  hasOwnerAccount(): boolean {
    if (isSupabaseConfigured()) {
      return true; // Supabase handles account existence check on login
    }
    const raw = localStorage.getItem(OFFLINE_OWNER_KEY);
    return Boolean(raw);
  },

  // 1. Sign In (Normal Email + Password Login)
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // A. Use Supabase Auth when configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) {
          console.warn('Supabase signInWithPassword error:', error.message);
          return { success: false, error: 'Invalid email or password.' };
        }

        if (data.user) {
          const user: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            role: 'owner'
          };
          return { success: true, user };
        }
        return { success: false, error: 'Invalid email or password.' };
      } catch (err) {
        console.warn('Supabase signIn exception:', err);
        return { success: false, error: 'Invalid email or password.' };
      }
    }

    // B. Offline Local Provider (used when Supabase is not configured)
    const rawOwner = localStorage.getItem(OFFLINE_OWNER_KEY);
    if (!rawOwner) {
      return { 
        success: false, 
        error: 'No owner account found. Please click "Create Owner Account" to begin.' 
      };
    }

    try {
      const owner = JSON.parse(rawOwner);
      const inputHash = await hashPassword(password);
      
      // Match email and password hash
      const emailMatches = (owner.email || '').toLowerCase() === cleanEmail;
      const hashMatches = owner.passwordHash === inputHash;

      if (!emailMatches || !hashMatches) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const user: AuthUser = {
        id: owner.id || 'owner_offline_id',
        email: cleanEmail,
        role: 'owner'
      };

      const session: AuthSession = {
        user,
        token: `session_${crypto.randomUUID()}`,
        isAuthenticated: true
      };

      localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(session));
      return { success: true, user };
    } catch {
      return { success: false, error: 'Invalid email or password.' };
    }
  },

  // 2. Sign Up (Create Owner Account)
  async signUp(email: string, password: string): Promise<{ 
    success: boolean; 
    error?: string; 
    user?: AuthUser;
    requiresEmailVerification?: boolean;
  }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // A. Use Supabase Auth when configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session && data.user) {
          const user: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            role: 'owner'
          };
          return { success: true, user };
        }

        if (data.user) {
          // Supabase instance requires email verification
          return {
            success: true,
            requiresEmailVerification: true,
            user: {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              role: 'owner'
            }
          };
        }

        return { success: false, error: 'Failed to create account.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to create account.' };
      }
    }

    // B. Offline Local Provider
    try {
      const passwordHash = await hashPassword(password);
      const user: AuthUser = {
        id: crypto.randomUUID(),
        email: cleanEmail,
        role: 'owner'
      };

      localStorage.setItem(OFFLINE_OWNER_KEY, JSON.stringify({
        id: user.id,
        email: cleanEmail,
        passwordHash,
        createdAt: new Date().toISOString()
      }));

      const session: AuthSession = {
        user,
        token: `session_${crypto.randomUUID()}`,
        isAuthenticated: true
      };
      localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(session));

      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create account.' };
    }
  },

  // 3. Forgot Password
  async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}#reset-password`
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to dispatch reset email.' };
      }
    }

    // Offline mode: confirm dispatch
    return { success: true };
  },

  // 4. Update Password (after clicking reset link)
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update password.' };
      }
    }

    // Offline mode
    const rawOwner = localStorage.getItem(OFFLINE_OWNER_KEY);
    if (rawOwner) {
      const owner = JSON.parse(rawOwner);
      owner.passwordHash = await hashPassword(newPassword);
      localStorage.setItem(OFFLINE_OWNER_KEY, JSON.stringify(owner));
    }
    return { success: true };
  },

  // 5. Get Current Session
  async getSession(): Promise<AuthSession> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          return {
            isAuthenticated: true,
            user: {
              id: data.session.user.id,
              email: data.session.user.email || '',
              role: 'owner'
            },
            token: data.session.access_token
          };
        }
      } catch (err) {
        console.warn('Error reading Supabase session:', err);
      }
    }

    const sessionRaw = localStorage.getItem(OFFLINE_SESSION_KEY) || sessionStorage.getItem(OFFLINE_SESSION_KEY);
    if (!sessionRaw) {
      return { isAuthenticated: false, user: null, token: null };
    }

    try {
      const parsed = JSON.parse(sessionRaw);
      return {
        isAuthenticated: true,
        user: parsed.user,
        token: parsed.token
      };
    } catch {
      return { isAuthenticated: false, user: null, token: null };
    }
  },

  // 6. Sign Out
  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error signing out of Supabase:', err);
      }
    }
    localStorage.removeItem(OFFLINE_SESSION_KEY);
    sessionStorage.removeItem(OFFLINE_SESSION_KEY);
  },

  // 7. Subscribe to Auth State Changes
  onAuthStateChange(callback: (session: AuthSession) => void): { unsubscribe: () => void } {
    if (isSupabaseConfigured() && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          callback({
            isAuthenticated: true,
            user: {
              id: session.user.id,
              email: session.user.email || '',
              role: 'owner'
            },
            token: session.access_token
          });
        } else {
          callback({
            isAuthenticated: false,
            user: null,
            token: null
          });
        }
      });
      return { unsubscribe: () => data.subscription.unsubscribe() };
    }

    // Offline mode: no external auth events
    return { unsubscribe: () => {} };
  }
};
