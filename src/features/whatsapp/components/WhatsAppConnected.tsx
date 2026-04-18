import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    <View className="flex-1 bg-[#121212] items-center justify-center p-8">
      <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center border border-green-500/30">
        <Ionicons name="checkmark" size={40} color="#4ade80" />
      </View>
      <Text className="text-xl font-bold text-white mt-6 mb-2">
        Bot operativo
      </Text>
      <Text className="text-gray-400 text-center mb-8">
        El sistema está escuchando mensajes de WhatsApp correctamente.
      </Text>

      <TouchableOpacity
        onPress={onLogout}
        disabled={actionLoading}
        className="bg-red-500/20 border border-red-500/50 py-3 px-8 rounded-xl flex-row items-center justify-center w-full"
      >
        {actionLoading ? (
          <ActivityIndicator color="#f87171" />
        ) : (
          <Text className="text-red-400 font-bold">Desvincular WhatsApp</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onRestart}
        disabled={actionLoading}
        className="bg-gray-800/50 py-3 px-8 rounded-xl flex-row items-center justify-center w-full mt-4"
      >
        <Text className="text-gray-300 font-bold">Forzar Reinicio del Bot</Text>
      </TouchableOpacity>
    </View>
  );
};
