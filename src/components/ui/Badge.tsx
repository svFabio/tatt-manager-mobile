import React from "react";
import { View, Text, type ViewProps } from "react-native";
import { COLORS } from "@/src/theme/colors";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends ViewProps {
  /** Texto del badge */
  label: string;
  /** Variante visual */
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: COLORS.dark[300], text: COLORS.text.muted },
  success: { bg: COLORS.status.confirmada.bg, text: COLORS.status.confirmada.text },
  warning: { bg: COLORS.warning.ghost, text: COLORS.warning.DEFAULT },
  danger: { bg: COLORS.danger.bg, text: COLORS.danger.text },
  info: { bg: COLORS.primary.ghost, text: COLORS.primary.light },
};

/**
 * Badge/Chip pequeño para mostrar estados de solicitudes y citas.
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  className,
  style,
  ...props
}) => {
  const s = variantStyles[variant];

  return (
    <View
      className={`px-3 py-1 rounded-full self-start ${className || ""}`}
      style={[{ backgroundColor: s.bg }, style]}
      {...props}
    >
      <Text className="text-xs font-semibold" style={{ color: s.text }}>{label}</Text>
    </View>
  );
};
