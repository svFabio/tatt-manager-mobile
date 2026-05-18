import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[API Error] ${error.response.status}: ${error.response.data?.message || "Error desconocido"}`
      );
    } else if (error.request) {
      console.error("[API Error] No se recibió respuesta del servidor.");
      error.message = "El servidor está arrancando o no hay internet. Intenta en unos segundos.";
    } else {
      console.error("[API Error]", error.message);
      if (error.message === "Network Error") {
        error.message = "El servidor está arrancando o no hay internet. Intenta en unos segundos.";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
