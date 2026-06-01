import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/src/components/StyledText';
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";

interface WhatsAppQRCodeProps {
  qrValor: string | null;
  onRegenerate: () => void;
  actionLoading: boolean;
}

export const WhatsAppQRCode: React.FC<WhatsAppQRCodeProps> = ({
  qrValor,
  onRegenerate,
  actionLoading,
}) => {
  return (
    <View>
      <View className="bg-dark-100 p-6 rounded-3xl border border-dark-300 items-center mb-6 shadow-xl shadow-black">
        <View className="flex-row items-center mb-6 bg-dark-200 px-4 py-2 rounded-full border border-dark-300">
          <Ionicons name="qr-code-outline" size={16} color={COLORS.text.muted} />
          <Text className="text-xs font-bold tracking-widest ml-2 uppercase text-text-secondary">
            Código QR de Vinculación
          </Text>
        </View>

        {qrValor ? (
          <View className="bg-white p-4 rounded-[1.5rem] mb-6">
            <QRCode value={qrValor} size={220} />
          </View>
        ) : (
          <View className="w-[220px] h-[220px] items-center justify-center bg-dark-200 rounded-[1.5rem] mb-6 border border-dark-300 border-dashed">
            <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
            <Text className="mt-4 font-medium text-text-muted">Generando...</Text>
          </View>
        )}

        <Text className="text-center text-sm leading-6 mb-6 text-text-secondary">
          Escanea este código con WhatsApp en tu teléfono para comenzar la
          vinculación.
        </Text>

        <TouchableOpacity
          onPress={onRegenerate}
          disabled={actionLoading}
          className="w-full bg-dark-200 py-4 rounded-2xl flex-row items-center justify-center border border-dark-300"
        >
          {actionLoading ? (
             <ActivityIndicator color={COLORS.primary.DEFAULT} />
          ) : (
             <>
               <Ionicons name="refresh-outline" size={18} color={COLORS.primary.DEFAULT} />
               <Text className="text-primary font-bold ml-2">Regenerar Código</Text>
             </>
          )}
        </TouchableOpacity>
      </View>

      {/* Steps para QR */}
      <View className="bg-dark-100 p-5 rounded-3xl border border-dark-300 mb-4 flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-dark-200 items-center justify-center mr-4 border border-dark-300">
          <Text className="font-bold text-text-primary">1</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold mb-1">Abre WhatsApp</Text>
          <Text className="text-xs text-text-muted">
            Ve a Configuración {">"} Dispositivos vinculados
          </Text>
        </View>
      </View>
      <View className="bg-dark-100 p-5 rounded-3xl border border-dark-300 flex-row items-center mb-8">
        <View className="w-10 h-10 rounded-full bg-dark-200 items-center justify-center mr-4 border border-dark-300">
          <Text className="font-bold text-text-primary">2</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold mb-1">Escanea</Text>
          <Text className="text-xs text-text-muted">
            Apunta la cámara de tu teléfono a esta pantalla
          </Text>
        </View>
      </View>
    </View>
  );
};
