import React, { useState } from "react";
import { View, TouchableOpacity, type TextInputProps } from "react-native";
import { Text, TextInput } from "@/src/components/StyledText";
import { COLORS } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";

interface InputFieldProps extends TextInputProps {
  /** Etiqueta del campo */
  label?: string;
  /** Mensaje de error */
  error?: string;
  /** Si es true, muestra el icono de ojo para alternar visibilidad */
  isPassword?: boolean;
}

/**
 * Campo de texto estilizado con tema oscuro y acento dorado.
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  isPassword,
  className,
  secureTextEntry,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry || isPassword);

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-muted-light text-sm font-medium mb-2">
          {label}
        </Text>
      ) : null}
      <View className="relative justify-center">
        <TextInput
          className={`
            bg-dark-200 text-white rounded-xl px-4 py-3
            border ${error ? "border-alert" : "border-dark-300"}
            focus:border-gold
            placeholder:text-muted-dark
            ${isPassword ? "pr-12" : ""}
            ${className || ""}
          `}
          placeholderTextColor={COLORS.text.muted}
          secureTextEntry={isSecure}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            className="absolute right-4"
            onPress={() => setIsSecure(!isSecure)}
          >
            <Ionicons
              name={isSecure ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.text.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text className="text-alert text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );
};
