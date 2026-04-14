const AUTH_STORAGE_KEY = "personal-assistant-auth";

export const getStoredAuth = () => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { user: null, accessToken: null };
  } catch (error) {
    return { user: null, accessToken: null };
  }
};

export const setStoredAuth = (value) => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
};

export const clearStoredAuth = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const updateStoredToken = (accessToken) => {
  const current = getStoredAuth();
  setStoredAuth({
    ...current,
    accessToken,
  });
};
