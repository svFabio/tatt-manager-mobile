import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

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
  primary: "bg-gold active:bg-gold-dark",
  secondary: "bg-dark-200 active:bg-dark-300",
  outline: "bg-transparent border-2 border-gold active:bg-gold/10",
  danger: "bg-alert active:bg-alert-dark",
  ghost: "bg-transparent active:bg-dark-200",
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: "text-dark font-bold",
  secondary: "text-white font-semibold",
  outline: "text-gold font-semibold",
  danger: "text-white font-bold",
  ghost: "text-gold font-medium",
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
          color={variant === "primary" ? "#121212" : "#D4AF37"}
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
