/**
 * Tema global de la aplicación.
 * Fuente única para colores, sombras y estilos reutilizables.
 * NUNCA hardcodear hex en componentes — importar desde aquí.
 */

import palette from './palette';

export const COLORS = palette as {
  readonly bg: string;
  readonly dark: {
    readonly DEFAULT: string;
    readonly 100: string;
    readonly 200: string;
    readonly 300: string;
    readonly 400: string;
  };
  readonly gold: {
    readonly [key: string]: string;
  };
  readonly primary: {
    readonly DEFAULT: string;
    readonly light: string;
    readonly dark: string;
    readonly ghost: string;
    readonly border: string;
  };
  readonly danger: {
    readonly DEFAULT: string;
    readonly text: string;
    readonly bg: string;
    readonly badge: string;
    readonly ghost: string;
    readonly border: string;
  };
  readonly success: {
    readonly DEFAULT: string;
  };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly muted: string;
    readonly dimmed: string;
  };
  readonly border: {
    readonly subtle: string;
  };
  readonly warning: {
    readonly DEFAULT: string;
    readonly text: string;
    readonly ghost: string;
  };
  readonly status: {
    readonly confirmada: { readonly text: string; readonly bg: string };
    readonly pendiente: { readonly text: string; readonly bg: string };
    readonly finalizada: { readonly text: string; readonly bg: string };
    readonly cancelada: { readonly text: string; readonly bg: string };
  };
  readonly alert: {
    readonly DEFAULT: string;
    readonly light: string;
    readonly dark: string;
  };
  readonly muted: {
    readonly DEFAULT: string;
    readonly light: string;
    readonly dark: string;
  };
};

/** Sombra reutilizable con glow del color primario */
export const PRIMARY_SHADOW = {
  shadowColor: COLORS.primary.DEFAULT,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.35,
  shadowRadius: 10,
  elevation: 6,
};

export type Theme = typeof COLORS;
