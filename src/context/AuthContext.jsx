import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AuthDrawer from "../components/AuthDrawer";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");

  useEffect(() => {
    localStorage.setItem("isLoggedIn", String(isLoggedIn));
  }, [isLoggedIn]);

  const openAuth = useCallback((tab = "login") => {
    setAuthTab(tab);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
    setAuthOpen(false);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      authOpen,
      authTab,
      setAuthTab,
      isLoggedIn,
      openAuth,
      closeAuth,
      login,
      logout,
    }),
    [authOpen, authTab, isLoggedIn, openAuth, closeAuth, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      <div className="relative min-h-screen overflow-x-hidden">
        <div
          className={`min-h-screen transition-[filter] duration-300 ${authOpen ? "brightness-[0.92]" : ""}`}
        >
          {children}
        </div>
        <AuthDrawer />
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
