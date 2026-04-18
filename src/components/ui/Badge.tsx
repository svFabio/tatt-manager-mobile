import React from "react";
import { View, Text, type ViewProps } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends ViewProps {
  /** Texto del badge */
  label: string;
  /** Variante visual */
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: "bg-dark-300", text: "text-muted-light" },
  success: { container: "bg-green-900/50", text: "text-green-400" },
  warning: { container: "bg-gold-900/50", text: "text-gold-light" },
  danger: { container: "bg-red-900/50", text: "text-alert-light" },
  info: { container: "bg-blue-900/50", text: "text-blue-400" },
};

/**
 * Badge/Chip pequeño para mostrar estados de solicitudes y citas.
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  className,
  ...props
}) => {
  const styles = variantStyles[variant];

  return (
    <View
      className={`
        px-3 py-1 rounded-full self-start
        ${styles.container}
        ${className || ""}
      `}
      {...props}
    >
      <Text className={`text-xs font-semibold ${styles.text}`}>{label}</Text>
    </View>
  );
};
