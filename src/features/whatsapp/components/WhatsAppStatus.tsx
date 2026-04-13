import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/src/components/ui";

interface WhatsAppStatusProps {
  isConnected: boolean;
  lastSync?: string;
}

/**
 * Indicador visual del estado de conexión con el bot de WhatsApp.
 */
export const WhatsAppStatus: React.FC<WhatsAppStatusProps> = ({
  isConnected,
  lastSync,
}) => {
  return (
    <Card className="mb-3">
      <View className="flex-row items-center">
        {/* Indicador de conexión */}
        <View
          className={`w-3 h-3 rounded-full mr-3 ${
            isConnected ? "bg-green-500" : "bg-alert"
          }`}
        />
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">
            Bot de WhatsApp
          </Text>
          <Text className="text-muted text-xs">
            {isConnected ? "Conectado y escuchando" : "Desconectado"}
          </Text>
        </View>
        {lastSync && (
          <Text className="text-muted-dark text-xs">
            Últ. sync: {lastSync}
          </Text>
        )}
      </View>
    </Card>
  );
};
