// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const initializeAuth = async () => {
      try {
        console.log('🔵 Initializing Auth...');
        
        // Set a safety timeout - force loading to false after 5 seconds
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            console.warn('⚠️ Auth initialization timeout - forcing loading to false');
            setLoading(false);
          }
        }, 5000);

        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('🔴 Session error:', sessionError);
          if (isMounted) {
            setAuthError(sessionError.message);
            setLoading(false);
          }
          return;
        }

        console.log('🔵 Session:', session ? '✅ Has session' : '❌ No session');

        if (session?.user) {
          // Fetch profile
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.warn('🔴 Profile fetch error:', profileError);
              
              // Try to create profile
              if (profileError.code === 'PGRST116') {
                console.log('🔵 Creating profile...');
                await supabase
                  .from('profiles')
                  .insert([{
                    id: session.user.id,
                    name: session.user.email,
                    email: session.user.email,
                    role: 'user'
                  }]);
              }
              
              // Use fallback
              const userData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.email,
                role: 'user'
              };
              if (isMounted) {
                setUser(userData);
                localStorage.setItem('sacramental_user', JSON.stringify(userData));
              }
            } else {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                name: profile.name || session.user.email,
                role: profile.role || 'user'
              };
              if (isMounted) {
                setUser(userData);
                localStorage.setItem('sacramental_user', JSON.stringify(userData));
              }
            }
          } catch (profileError) {
            console.error('🔴 Profile error:', profileError);
            // Use fallback
            const userData = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.email,
              role: 'user'
            };
            if (isMounted) {
              setUser(userData);
              localStorage.setItem('sacramental_user', JSON.stringify(userData));
            }
          }
        } else {
          // Check localStorage for cached user
          const cachedUser = localStorage.getItem('sacramental_user');
          if (cachedUser) {
            try {
              const parsed = JSON.parse(cachedUser);
              console.log('🔵 Using cached user:', parsed);
              if (isMounted) {
                setUser(parsed);
              }
            } catch (e) {
              console.error('🔴 Error parsing cached user:', e);
              localStorage.removeItem('sacramental_user');
            }
          }
        }
        
        // Always set loading to false
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('🔴 Fatal error in initializeAuth:', error);
        if (isMounted) {
          setAuthError(error.message);
          setLoading(false);
        }
      } finally {
        // Clear the timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // Ensure loading is false
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔵 Auth state changed:', event);
      
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('sacramental_user');
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Re-fetch profile
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile, error }) => {
              if (error) {
                console.error('🔴 Profile fetch error on auth change:', error);
                const userData = {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.email,
                  role: 'user'
                };
                if (isMounted) {
                  setUser(userData);
                  localStorage.setItem('sacramental_user', JSON.stringify(userData));
                }
              } else {
                const userData = {
                  id: session.user.id,
                  email: session.user.email,
                  name: profile.name || session.user.email,
                  role: profile.role || 'user'
                };
                if (isMounted) {
                  setUser(userData);
                  localStorage.setItem('sacramental_user', JSON.stringify(userData));
                }
              }
              if (isMounted) {
                setLoading(false);
              }
            })
            .catch(err => {
              console.error('🔴 Error in auth change handler:', err);
              if (isMounted) {
                setLoading(false);
              }
            });
        }
      }
      
      // Ensure loading is false
      if (isMounted) {
        setTimeout(() => setLoading(false), 100);
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    console.log('🔵 Login attempt:', email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        console.error('🔴 Login error:', error.message);
        setLoading(false);
        return false;
      }

      console.log('✅ Login successful');
      
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || data.user.email,
          role: profile?.role || 'user'
        };
        setUser(userData);
        localStorage.setItem('sacramental_user', JSON.stringify(userData));
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('🔴 Login exception:', error);
      setLoading(false);
      return false;
    }
  };

  const register = async (userData) => {
    console.log('🔵 Register attempt:', userData.email);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password.trim(),
        options: {
          data: {
            name: userData.name.trim()
          }
        }
      });

      if (error) {
        console.error('🔴 Register error:', error.message);
        setLoading(false);
        throw error;
      }

      console.log('✅ Register successful');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('🔴 Register exception:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🔵 Logout');
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('sacramental_user');
    } catch (error) {
      console.error('🔴 Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose the loading state and a way to force refresh
  const refreshUser = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      const userData = {
        id: session.user.id,
        email: session.user.email,
        name: profile?.name || session.user.email,
        role: profile?.role || 'user'
      };
      setUser(userData);
      localStorage.setItem('sacramental_user', JSON.stringify(userData));
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      error: authError,
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};