# Tatt Manager - Mobile App 📱

Aplicación móvil desarrollada en **React Native (Expo)** para la gestión en tiempo real de tu estudio de tatuajes. Integrada nativamente con WebSockets para recibir actualizaciones del Bot de WhatsApp y renderizar solicitudes gráficas, citas y la matriz temporal de artistas.

## Setup Local (Quick Start)

1. **Instalación:**
   ```bash
   git clone <repository-url>
   cd tatt-manager-mobile
   npm install
   ```

2. **Variables de Entorno Cruciales:**
   Crea un archivo `.env` en la raíz de la carpeta móvil. Es obligatorio para que el teléfono encuentre al backend.
   ```env
   EXPO_PUBLIC_API_URL=http://<IP-DE-TU-PC>:3000/api
   EXPO_PUBLIC_SOCKET_URL=http://<IP-DE-TU-PC>:3000
   ```
   *(Asegúrate de cambiar la IP por tu dirección IPv4 local mientras desarrollas, ej: `192.168.1.5`)*

3. **Arrancar la App:**
   ```bash
   npx expo start -c
   ```

## Tecnologías

- **Framework**: Expo + React Native.
- **Navegación**: Expo Router (Enrutamiento mediante sistema de archivos en `app/`).
- **Arquitectura**: Feature-Sliced Design (`src/features/`).
- **Estados & Red**: Zustand (Client State) + Axios (REST) + Socket.IO (Realtime Socket).
- **Estilos**: NativeWind v4 (Tailwind CSS puro para compilación óptima).

## Arquitectura de Rutas y Features

El desarrollo está segmentado por dominios de negocio puristas para alta cohesión:

```text
tatt-manager-mobile/
├── app/                      
│   ├── (auth)/               # Pantalla inicial de Login
│   └── (drawer)/             # Menú lateral base
│       ├── agenda.tsx        # Render de citas actuales
│       ├── calendar.tsx      # Matriz mensual
│       └── whatsapp.tsx      # Consola del bot inteligente
├── src/                      
│   ├── api/                  # Axios (.env interceptors) + Sockets
│   ├── features/             # Piezas de Lego del sistema
│   │   ├── appointments/     # UI de tarjetas de citas
│   │   └── whatsapp/         # UI modular del Pair Code y status
│   └── store/                # Zustand global state
```

## CI / CD
Configurado con **GitHub Actions** para:
- Revisar que la validación TypeScript (`npx tsc`) es exitosa.
- Emitir builds nativos automáticos `.apk` o `.aab` a través de EAS.
