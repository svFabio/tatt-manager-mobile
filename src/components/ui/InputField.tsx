import React from "react";
import { TextInput, View, Text, type TextInputProps } from "react-native";

interface InputFieldProps extends TextInputProps {
  /** Etiqueta del campo */
  label?: string;
  /** Mensaje de error */
  error?: string;
}

/**
 * Campo de texto estilizado con tema oscuro y acento dorado.
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-muted-light text-sm font-medium mb-2">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={`
          bg-dark-200 text-white rounded-xl px-4 py-3
          border ${error ? "border-alert" : "border-dark-300"}
          focus:border-gold
          placeholder:text-muted-dark
          ${className || ""}
        `}
        placeholderTextColor="#6B7280"
        {...props}
      />
      {error ? (
        <Text className="text-alert text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );
};
