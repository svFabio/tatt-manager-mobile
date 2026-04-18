import React from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WhatsAppPairCodeProps {
  pairingCode: string | null;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  onRequestPairing: () => void;
  onResetPairing: () => void;
  actionLoading: boolean;
}

export const WhatsAppPairCode: React.FC<WhatsAppPairCodeProps> = ({
  pairingCode,
  phoneNumber,
  setPhoneNumber,
  onRequestPairing,
  onResetPairing,
  actionLoading,
}) => {
  return (
    <View>
      {pairingCode ? (
        <View className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#8b5cf6]/30 items-center justify-center mb-6 relative overflow-hidden">
          <View className="absolute top-0 right-0 p-4 opacity-5">
            <Ionicons name="keypad" size={100} color="#8b5cf6" />
          </View>
          <Text className="text-gray-400 font-medium mb-6 text-center text-sm">
            Tu código se ha generado correctamente.
          </Text>
          <View className="bg-[#242424] px-8 py-5 rounded-2xl border border-[#333]">
            <Text className="text-5xl font-mono font-black tracking-[0.2em] text-white">
              {pairingCode}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onResetPairing}
            className="mt-8 border-b border-[#8b5cf6]/50 pb-1"
          >
            <Text className="text-[#8b5cf6] font-semibold text-sm">
              Solicitar nuevo código
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3 pl-1">
            Número de teléfono (con código de país)
          </Text>
          <View className="bg-[#1a1a1a] rounded-2xl border border-[#2b2b2b] px-4 py-1 mb-2">
            <TextInput
              className="text-white text-lg py-3 font-medium"
              placeholder="Ej: 59171234567"
              placeholderTextColor="#4b5563"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!actionLoading}
            />
          </View>
          <Text className="text-gray-600 text-xs italic mb-6 pl-1 pr-1">
            Sin + ni espacios. Bolivia: 591 + número. Argentina: 54 + area +
            numero
          </Text>

          <TouchableOpacity
            disabled={actionLoading || phoneNumber.length < 7}
            onPress={onRequestPairing}
            className={`w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg ${
              phoneNumber.length >= 7
                ? "bg-[#8b5cf6] shadow-[#8b5cf6]/20"
                : "bg-[#374151]"
            }`}
          >
            {actionLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Obtener codigo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Info Card Pair */}
      <View className="bg-[#1a1a1a] p-6 rounded-3xl mt-8 border border-[#2b2b2b]">
        <View className="flex-row items-center mb-6">
          <Ionicons name="information-circle-outline" size={24} color="#a78bfa" />
          <Text className="text-[#a78bfa] font-bold text-lg ml-2">
            Como funciona:
          </Text>
        </View>

        <View className="space-y-6">
          {[
            "Ingresa tu numero con codigo de pais",
            "Copia el codigo generado",
            "En WhatsApp: Dispositivos vinculados - Vincular con numero",
            "Ingresa el codigo en WhatsApp nativo",
          ].map((paso, index) => (
            <View key={index} className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-[#2a2a2a] items-center justify-center mr-4 border border-[#3b3b3b]">
                <Text className="text-[#8b5cf6] font-bold text-xs">{index + 1}</Text>
              </View>
              <Text className="text-gray-300 font-medium flex-1 text-sm">
                {paso}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
