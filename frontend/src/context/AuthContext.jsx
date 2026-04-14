import { createContext, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../api/client";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../utils/storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncFromStorage = () => {
    const stored = getStoredAuth();
    setUser(stored.user || null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredAuth();

      if (stored.accessToken) {
        try {
          const response = await api.get("/auth/me", { skipAuthRefresh: false });
          setStoredAuth({
            accessToken: stored.accessToken,
            user: response.data.user,
          });
          setUser(response.data.user);
          setLoading(false);
          return;
        } catch (error) {
          clearStoredAuth();
        }
      }

      try {
        const refreshResponse = await api.post("/auth/refresh", {}, { skipAuthRefresh: true });
        const meResponse = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${refreshResponse.data.accessToken}`,
          },
          skipAuthRefresh: true,
        });

        setStoredAuth({
          accessToken: refreshResponse.data.accessToken,
          user: meResponse.data.user,
        });
        setUser(meResponse.data.user);
      } catch (error) {
        clearStoredAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    const onLogout = () => {
      clearStoredAuth();
      setUser(null);
    };

    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload, { skipAuthRefresh: true });
    setStoredAuth({
      accessToken: response.data.accessToken,
      user: response.data.user,
    });
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload, { skipAuthRefresh: true });
    setStoredAuth({
      accessToken: response.data.accessToken,
      user: response.data.user,
    });
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { skipAuthRefresh: true });
    } finally {
      clearStoredAuth();
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    const response = await api.get("/auth/me");
    const stored = getStoredAuth();
    setStoredAuth({
      accessToken: stored.accessToken,
      user: response.data.user,
    });
    syncFromStorage();
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshProfile,
      getErrorMessage: getApiErrorMessage,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
