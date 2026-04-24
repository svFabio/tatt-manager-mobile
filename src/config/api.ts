// Configuración de la API
// Para emulador Android: 10.0.2.2
// Para emulador iOS: localhost
// Para dispositivo físico: Tu IP de red local

// Obtener IP de red local (Windows: ipconfig, Mac/Linux: ifconfig)
const IP = '192.168.0.2'; // ⚠️ CAMBIA ESTO POR TU IP LOCAL

export const API_URL = __DEV__ 
  ? `http://${IP}:3000/api`  // Desarrollo con dispositivo físico
  : 'https://tu-dominio.com/api'; // Producción

// Para probar en emulador Android descomenta esta línea:
// export const API_URL = 'http://10.0.2.2:3000/api';

// Para probar en emulador iOS descomenta esta línea:
// export const API_URL = 'http://localhost:3000/api';

export default { API_URL };