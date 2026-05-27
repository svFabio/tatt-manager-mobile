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
    // Importación dinámica para evitar ciclos de dependencia si los hubiera
    const { useAuthStore } = require("../store/useAuthStore");
    const { useStudioStore } = require("../store/useStudioStore");
    
    const studioToken = useStudioStore.getState().studioToken;
    const token = useAuthStore.getState().token;
    
    const activeToken = studioToken || token;
    
    if (activeToken) config.headers.Authorization = `Bearer ${activeToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[API Error] ${error.response.status}: ${error.response.data?.error || error.response.data?.message || "Error desconocido"}`
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
