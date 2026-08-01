import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('sacramental_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('sacramental_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem('sacramental_user', JSON.stringify(safeUser));
      return true;
    }
    return false;
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('sacramental_users') || '[]');
    userData.id = Date.now();
    userData.role = 'user';
    users.push(userData);
    localStorage.setItem('sacramental_users', JSON.stringify(users));
    const { password, ...safeUser } = userData;
    setUser(safeUser);
    localStorage.setItem('sacramental_user', JSON.stringify(safeUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sacramental_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);