import axios from "axios";

/**
 * Instancia centralizada de Axios para todas las peticiones HTTP.
 * Cambia la BASE_URL por la dirección de tu servidor backend.
 */

const BASE_URL = "http://192.168.1.100:3000/api"; // ⬅️ Cambia esto por tu IP/dominio

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Interceptor de Request ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar un token de autenticación si lo necesitas:
    // const token = await AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de Response ───────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo centralizado de errores
    if (error.response) {
      console.error(
        `[API Error] ${error.response.status}: ${error.response.data?.message || "Error desconocido"}`
      );
    } else if (error.request) {
      console.error("[API Error] No se recibió respuesta del servidor.");
    } else {
      console.error("[API Error]", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
