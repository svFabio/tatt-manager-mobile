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
      const status = error.response.status;
      const msg = error.response.data?.error || error.response.data?.message || "Error desconocido";
      
      // Si es un error del servidor (500+), usamos console.error
      // Si es un error de cliente (400-499, como código inválido), usamos console.log para no lanzar la pantalla de error de Expo.
      if (status >= 500) {
        console.error(`[API Error] ${status}: ${msg}`);
      } else {
        console.log(`[API Response] ${status}: ${msg}`);
      }
    } else if (error.request) {
      console.log("[API Error] No se recibió respuesta del servidor.");
      error.message = "El servidor está arrancando o no hay internet. Intenta en unos segundos.";
    } else {
      console.log("[API Error]", error.message);
      if (error.message === "Network Error") {
        error.message = "El servidor está arrancando o no hay internet. Intenta en unos segundos.";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
