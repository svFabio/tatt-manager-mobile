import React from "react";
import {
  TouchableOpacity, ActivityIndicator, type TouchableOpacityProps, } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { COLORS } from "../../theme/colors";

// ─── Tipos ─────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface CustomButtonProps extends TouchableOpacityProps {
  /** Texto del botón */
  title: string;
  /** Variante visual del botón */
  variant?: ButtonVariant;
  /** Tamaño del botón */
  size?: ButtonSize;
  /** Muestra un spinner de carga */
  loading?: boolean;
  /** Ancho completo */
  fullWidth?: boolean;
}

// ─── Mapas de estilos NativeWind ───────────────────────────────────────────

const variantContainerStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primary-dark",
  secondary: "bg-dark-200 active:bg-dark-300",
  outline: "bg-transparent border border-white/20 active:bg-white/10",
  danger: "bg-alert active:bg-alert-dark",
  ghost: "bg-transparent active:bg-dark-200",
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: "text-text-primary font-bold",
  secondary: "text-text-primary font-semibold",
  outline: "text-white font-semibold tracking-wide",
  danger: "text-text-primary font-bold",
  ghost: "text-primary font-medium",
};

const sizeContainerStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-4 rounded-lg",
  md: "py-3 px-6 rounded-xl",
  lg: "py-4 px-8 rounded-2xl",
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

// ─── Componente ────────────────────────────────────────────────────────────

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        items-center justify-center flex-row
        ${variantContainerStyles[variant]}
        ${sizeContainerStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50" : ""}
        ${className || ""}
      `}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? COLORS.dark.DEFAULT : COLORS.primary.DEFAULT}
          className="mr-2"
        />
      ) : null}
      <Text
        className={`
          ${variantTextStyles[variant]}
          ${sizeTextStyles[size]}
          text-center
        `}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
