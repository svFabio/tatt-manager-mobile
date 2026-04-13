import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";

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
      <View className="bg-[#1a1a1a] p-6 rounded-3xl border border-[#2b2b2b] items-center mb-6 shadow-xl shadow-black">
        <View className="flex-row items-center mb-6 bg-[#262626] px-4 py-2 rounded-full border border-[#333]">
          <Ionicons name="qr-code-outline" size={16} color="#9ca3af" />
          <Text className="text-gray-400 text-xs font-bold tracking-widest ml-2 uppercase">
            Código QR de Vinculación
          </Text>
        </View>

        {qrValor ? (
          <View className="bg-white p-4 rounded-[1.5rem] mb-6">
            <QRCode value={qrValor} size={220} />
          </View>
        ) : (
          <View className="w-[220px] h-[220px] items-center justify-center bg-[#242424] rounded-[1.5rem] mb-6 border border-[#2F2F2F] border-dashed">
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text className="text-gray-500 mt-4 font-medium">Generando...</Text>
          </View>
        )}

        <Text className="text-gray-400 text-center text-sm leading-6 mb-6">
          Escanea este código con WhatsApp en tu teléfono para comenzar la
          vinculación.
        </Text>

        <TouchableOpacity
          onPress={onRegenerate}
          disabled={actionLoading}
          className="w-full bg-[#242424] py-4 rounded-2xl flex-row items-center justify-center border border-[#333]"
        >
          {actionLoading ? (
             <ActivityIndicator color="#8b5cf6" />
          ) : (
             <>
               <Ionicons name="refresh-outline" size={18} color="#8b5cf6" />
               <Text className="text-[#8b5cf6] font-bold ml-2">Regenerar Código</Text>
             </>
          )}
        </TouchableOpacity>
      </View>

      {/* Steps para QR */}
      <View className="bg-[#1a1a1a] p-5 rounded-3xl border border-[#2b2b2b] mb-4 flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-[#262626] items-center justify-center mr-4 border border-[#333]">
          <Text className="text-gray-300 font-bold">1</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold mb-1">Abre WhatsApp</Text>
          <Text className="text-gray-500 text-xs">
            Ve a Configuración {">"} Dispositivos vinculados
          </Text>
        </View>
      </View>
      <View className="bg-[#1a1a1a] p-5 rounded-3xl border border-[#2b2b2b] flex-row items-center mb-8">
        <View className="w-10 h-10 rounded-full bg-[#262626] items-center justify-center mr-4 border border-[#333]">
          <Text className="text-gray-300 font-bold">2</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold mb-1">Escanea</Text>
          <Text className="text-gray-500 text-xs">
            Apunta la cámara de tu teléfono a esta pantalla
          </Text>
        </View>
      </View>
    </View>
  );
};
