/**
 * SINGLE SOURCE OF TRUTH PARA LOS COLORES
 * 
 * Tanto Tailwind (tailwind.config.js) como el tema de React Native (colors.ts)
 * leen de este mismo archivo. Si quieres cambiar el esquema de color,
 * hazlo únicamente aquí y se reflejará en toda la app.
 */

module.exports = {
  // ── Fondos ──
  bg: '#0A0A0A',
  
  // ── Escala de grises (dark) ──
  dark: {
    DEFAULT: '#121212',
    100: '#1E1E1E',
    200: '#2A2A2A',
    300: '#3A3A3A',
    400: '#4A4A4A',
  },

  // ── Dorado ──
  gold: {
    DEFAULT: "#4D09E0",
    light: "#7B3FF5",
    dark: "#3A07A8",
    50: "#FBF5E0",
    100: "#F5E8B5",
    200: "#EDDA87",
    300: "#E4CC59",
    400: "#DCC13B",
    500: "#4D09E0",
    600: "#C49B2D",
    700: "#B08623",
    800: "#9C711A",
    900: "#7A5610",
  },

  // ── Primario ──
  primary: {
    DEFAULT: '#4338CA',
    light: '#6366F1',
    dark: '#312E81',
    ghost: 'rgba(67, 56, 202, 0.12)',
    border: 'rgba(67, 56, 202, 0.1)',
  },

  // ── Alerta / Stock bajo ──
  danger: {
    DEFAULT: '#EF4444',
    text: '#F87171',
    bg: 'rgba(239, 68, 68, 0.1)',
    badge: '#F472B6',
    ghost: 'rgba(244, 114, 182, 0.15)',
    border: 'rgba(239, 68, 68, 0.2)',
  },

  // ── Éxito ──
  success: {
    DEFAULT: '#22C55E',
  },

  // ── Textos ──
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    dimmed: '#4B5563',
  },

  // ── Bordes genéricos ──
  border: {
    subtle: 'rgba(255,255,255,0.04)',
  },

  // ── Warning ──
  warning: {
    DEFAULT: '#F59E0B',
    text: '#FBBF24',
    ghost: 'rgba(245, 158, 11, 0.12)',
  },

  // ── Estados de cita ──
  status: {
    confirmada: { text: '#34D399', bg: 'rgba(52, 211, 153, 0.12)' },
    pendiente:  { text: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)' },
    finalizada: { text: '#60A5FA', bg: 'rgba(96, 165, 250, 0.12)' },
    cancelada:  { text: '#F87171', bg: 'rgba(248, 113, 113, 0.12)' },
  },

  // ── Retrocompatibilidad ──
  alert: {
    DEFAULT: "#FF3B30",
    light: "#FF6B63",
    dark: "#CC2F26",
  },
  muted: {
    DEFAULT: "#9CA3AF",
    light: "#D1D5DB",
    dark: "#6B7280",
  },
};
