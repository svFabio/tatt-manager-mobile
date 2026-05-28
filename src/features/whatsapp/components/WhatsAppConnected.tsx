import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";

interface WhatsAppConnectedProps {
  actionLoading: boolean;
  onLogout: () => void;
  onRestart: () => void;
}

export const WhatsAppConnected: React.FC<WhatsAppConnectedProps> = ({
  actionLoading,
  onLogout,
  onRestart,
}) => {
  return (
    <View className="flex-1 bg-dark items-center justify-center p-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center"
        style={{ backgroundColor: COLORS.status.confirmada.bg, borderWidth: 1, borderColor: COLORS.success.DEFAULT + '30' }}
      >
        <Ionicons name="checkmark" size={40} color={COLORS.success.DEFAULT} />
      </View>
      <Text className="text-xl font-bold text-white mt-6 mb-2">
        Bot operativo
      </Text>
      <Text className="text-center mb-8" style={{ color: COLORS.text.secondary }}>
        El sistema está escuchando mensajes de WhatsApp correctamente.
      </Text>

      <TouchableOpacity
        onPress={onLogout}
        disabled={actionLoading}
        className="py-3 px-8 rounded-xl flex-row items-center justify-center w-full"
        style={{ backgroundColor: COLORS.danger.bg, borderWidth: 1, borderColor: COLORS.danger.border }}
      >
        {actionLoading ? (
          <ActivityIndicator color={COLORS.danger.text} />
        ) : (
          <Text className="font-bold" style={{ color: COLORS.danger.text }}>Desvincular WhatsApp</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRestart}
        disabled={actionLoading}
        className="py-3 px-8 rounded-xl flex-row items-center justify-center w-full mt-4"
        style={{ backgroundColor: COLORS.dark[200] }}
      >
        <Text className="font-bold" style={{ color: COLORS.text.secondary }}>Forzar Reinicio del Bot</Text>
      </TouchableOpacity>
    </View>
  );
};
