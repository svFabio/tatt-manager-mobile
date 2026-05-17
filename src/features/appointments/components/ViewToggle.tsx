import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { VistaCalendario } from "../types";

interface ViewToggleProps {
  vista: VistaCalendario;
  onChange: (v: VistaCalendario) => void;
}

const OPCIONES: { key: VistaCalendario; label: string }[] = [
  { key: "month", label: "Mes" },
  { key: "day", label: "Día" },
];

export const ViewToggle: React.FC<ViewToggleProps> = ({ vista, onChange }) => {
  return (
    <View className="flex-row self-center bg-dark-100 rounded-full p-1 border border-dark-200">
      {OPCIONES.map((op) => {
        const activo = vista === op.key;
        return (
          <TouchableOpacity
            key={op.key}
            onPress={() => onChange(op.key)}
            activeOpacity={0.8}
            className={`px-6 py-2 rounded-full ${activo ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-sm font-semibold ${
                activo ? "text-white" : "text-muted"
              }`}
            >
              {op.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
