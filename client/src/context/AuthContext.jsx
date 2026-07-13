import { createContext, useContext, useState, useEffect } from 'react';

const USERS_KEY = 'attendance_users';
const SESSION_KEY = 'attendance_session';

const AuthContext = createContext(null);

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) {
      const users = getUsers();
      const found = users.find((u) => u.id === session.userId);
      if (found) {
        setUser({ id: found.id, name: found.name, email: found.email });
      } else {
        saveSession(null);
      }
    }
    setLoading(false);
  }, []);

  const register = (name, email, password) => {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === normalizedEmail)) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);

    const session = { userId: newUser.id, name: newUser.name, email: newUser.email };
    saveSession(session);
    setUser(session);
    return session;
  };

  const login = (email, password) => {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === normalizedEmail && u.password === password);

    if (!found) {
      throw new Error('Invalid email or password');
    }

    const session = { userId: found.id, name: found.name, email: found.email };
    saveSession(session);
    setUser(session);
    return session;
  };

  const logout = () => {
    saveSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
