# Tatt Manager - Mobile App

Aplicación móvil desarrollada en **React Native (Expo)** para la gestión integral de un estudio de tatuajes. Permite a los tatuadores administrar solicitudes de citas provenientes de un bot de WhatsApp, organizar su agenda, cotizar trabajos y gestionar su inventario.

## CI/CD

Este proyecto utiliza **GitHub Actions** para automatizar el proceso de integración y despliegue continuo.

### Workflows Disponibles

- **CI (Continuous Integration)**: Se ejecuta en cada push y pull request a **todas las ramas**
  - Verificación de tipos (TypeScript)
  - Verificación de compilación (usando Expo prebuild para validar configuración Android)

- **Build Android**: Se ejecuta automáticamente al hacer push a `main` o `dev`
  - Genera APK de producción usando EAS Build

- **Deploy Staging**: Se ejecuta al hacer push a `develop` o `dev`
  - Despliega automáticamente a Expo en el canal `staging`

### Configuración Requerida

Para que los workflows funcionen correctamente, necesitas configurar los siguientes secrets en tu repositorio de GitHub:

1. `EXPO_TOKEN`: Token de acceso a Expo (obtenlo de https://expo.dev/settings/access-tokens)
2. `EAS_PROJECT_ID`: ID del proyecto EAS (ver instrucciones abajo)

### Configuración de EAS

**EAS completamente configurado:**
- Archivo `.eas/project.json` con projectId y accountId
- `app.json` con `owner: "fsvabio"`
- Versiones remotas activadas (`eas.json`)
- CI configurado para builds y deploys

**Secrets requeridos en GitHub:**
- `EXPO_TOKEN`: Token de acceso a Expo

**Estado:** Listo para CI sin configuración adicional.

### Configuración de Versiones Automáticas

El proyecto está configurado para usar **versiones remotas automáticas**:

- `cli.appVersionSource: "remote"` - EAS maneja las versiones automáticamente
- `production.autoIncrement: true` - Se incrementan automáticamente en cada build
- No necesitas manejar versiones manualmente

Esto evita conflictos de versiones en CI y stores de apps.

### Comandos Locales

```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Verificación de compilación (valida configuración Android)
npx expo prebuild --platform android --clean

# Build para Android (desarrollo)
eas build --platform android --profile development

# Build para Android (producción)
eas build --platform android --profile production
```

### EAS Build (Expo Application Services)

El proyecto está configurado para usar EAS Build. Para builds locales:

```bash
# Build para desarrollo
eas build --platform android --profile development

# Build para preview
eas build --platform android --profile preview

# Build para producción
eas build --platform android --profile production
```

## Tecnologías Principales

- **Framework**: [React Native](https://reactnative.dev/) estructurado con [Expo](https://expo.dev/) y React 19.
- **Navegación**: [Expo Router](https://docs.expo.dev/router/introduction/) (Enrutamiento basado en archivos).
- **Estilos**: [NativeWind v4](https://www.nativewind.dev/) (Integra Tailwind CSS de manera nativa).
- **Gestor de Estado**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction).
- **Comunicaciones HTTP**: [Axios](https://axios-http.com/).
- **Tiempo Real**: [Socket.io Client](https://socket.io/docs/v4/client-api/) (Para recibir notificaciones del bot de WhatsApp).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) estricto.

## Arquitectura del Proyecto (Feature-Based)

El proyecto sigue una arquitectura orientada a funcionalidades cruzada con diseño de componentes UI centralizados, promoviendo el principio DRY (Don't Repeat Yourself).

```text
tatt-manager-mobile/
├── app/                      # Rutas de Expo Router
│   ├── _layout.tsx           # Layout principal (Proveedores, tema general)
│   ├── (auth)/               # Flujo de autenticación (Login)
│   └── (drawer)/             # Navegación principal (Menú lateral y pestañas)
│       ├── _layout.tsx       # Configuración del Custom Drawer
│       ├── index.tsx         # Dashboard / Resumen del día
│       ├── calendar.tsx      # Gestión de agenda y calendario interactivo
│       ├── requests.tsx      # Panel para responder solicitudes de citas
│       ├── end-session.tsx   # Formulario de cierre de sesión de tatuaje
│       └── ...
├── src/                      # Código base
│   ├── api/                  # Instancias y configuración de Axios
│   ├── components/ui/        # Componentes visuales genéricos (Botones, Tarjetas)
│   ├── features/             # Módulos del negocio
│   │   ├── appointments/     # Lógica y componentes de Citas
│   │   ├── requests/         # Lógica y componentes de Solicitudes
│   │   └── whatsapp/         # Lógica de emparejamiento con el bot
│   ├── hooks/                # Hooks globales reutilizables (ej. useWebSocket)
│   ├── store/                # Stores de Zustand centralizados
│   └── types/                # Declaraciones de tipos para TypeScript
└── ...                       # Archivos de configuración (Tailwind, Babel, Metro)
