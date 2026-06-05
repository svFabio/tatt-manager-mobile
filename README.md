# Tatt Manager - App Móvil

Aplicación móvil construida en React Native y Expo para gestionar el estudio de tatuajes en tiempo real.

## Requisitos Previos
* Node.js
* Tener la app de **Expo Go** instalada en tu teléfono celular (disponible en Android e iOS), o un emulador.

## Guía de Instalación Rápida

### 1. Instalar dependencias
Abre tu terminal en la carpeta `tatt-manager-mobile` y ejecuta:
```bash
npm install
```

### 2. Configurar Variables de Entorno (.env)
Crea un archivo llamado `.env` en la raíz de la carpeta `tatt-manager-mobile`. 

**MUY IMPORTANTE:** El celular necesita encontrar tu PC en la red WiFi. No puedes usar `localhost` para tu IP local. Debes averiguar la dirección IPv4 de tu computadora (por ejemplo, `192.168.1.5`) y usarla en las URLs, a menos que estés probando con URLs de producción.

Plantilla base del `.env`:
```env
# Conexión al Backend (Usa tu IPv4 local si desarrollas en red, o la URL de producción)
EXPO_PUBLIC_API_URL=http://<TU_IP_LOCAL>:3000/api
EXPO_PUBLIC_SOCKET_URL=http://<TU_IP_LOCAL>:3000

# Google Auth (Obligatorio para el inicio de sesión)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="tu_google_web_client_id.apps.googleusercontent.com"
```

### 3. Levantar la App
Inicia el servidor de Expo (limpiando caché para evitar errores):
```bash
npx expo start -c --go
```

**Para ver la app:** 
Abre la app **Expo Go** en tu dispositivo Android y escanea el código QR que aparece en la terminal. Si usas un dispositivo iOS, escanea el código con la aplicación de Cámara nativa.
