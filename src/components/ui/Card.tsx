import React from "react";
import { View, Text, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  /** Título de la card */
  title?: string;
  /** Subtítulo */
  subtitle?: string;
  /** Children */
  children?: React.ReactNode;
}

/**
 * Card genérica para secciones de contenido.
 * Tema oscuro con bordes sutiles dorados.
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className,
  ...props
}) => {
  return (
    <View
      className={`
        bg-dark-100 rounded-2xl p-4
        border border-dark-300
        ${className || ""}
      `}
      {...props}
    >
      {title ? (
        <View className="mb-3">
          <Text className="text-white text-lg font-bold">{title}</Text>
          {subtitle ? (
            <Text className="text-muted text-sm mt-1">{subtitle}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
};
