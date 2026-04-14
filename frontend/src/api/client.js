import axios from "axios";
import { clearStoredAuth, getStoredAuth, updateStoredToken } from "../utils/storage";

const normalizeBaseUrl = (value) => {
  if (!value) {
    return "/api";
  }

  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const { accessToken } = getStoredAuth();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.skipAuthRefresh &&
      !originalRequest?.url?.includes("/auth/refresh");

    if (shouldRefresh) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = api
          .post("/auth/refresh", {}, { skipAuthRefresh: true })
          .then((response) => {
            updateStoredToken(response.data.accessToken);
            return response.data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const nextToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearStoredAuth();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      clearStoredAuth();
      window.dispatchEvent(new Event("auth:logout"));
    }

    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || fallback;

export default api;
