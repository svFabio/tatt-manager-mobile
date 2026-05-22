import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput } from '@/src/components/StyledText';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";

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
        <View className="bg-dark-100 p-8 rounded-3xl border border-primary/30 items-center justify-center mb-6 relative overflow-hidden">
          <View className="absolute top-0 right-0 p-4 opacity-5">
            <Ionicons name="keypad" size={100} color={COLORS.primary.DEFAULT} />
          </View>
          <Text className="font-medium mb-6 text-center text-sm" style={{ color: COLORS.text.secondary }}>
            Tu código se ha generado correctamente.
          </Text>
          <View className="bg-dark-200 px-8 py-5 rounded-2xl border border-dark-300">
            <Text className="text-5xl font-mono font-black tracking-[0.2em] text-white">
              {pairingCode}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onResetPairing}
            className="mt-8 border-b border-primary/50 pb-1"
          >
            <Text className="text-primary font-semibold text-sm">
              Solicitar nuevo código
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text className="text-xs uppercase tracking-widest font-bold mb-3 pl-1" style={{ color: COLORS.text.secondary }}>
            Número de teléfono (con código de país)
          </Text>
          <View className="bg-dark-100 rounded-2xl border border-dark-300 px-4 py-1 mb-2">
            <TextInput
              className="text-white text-lg py-3 font-medium"
              placeholder="Ej: 59171234567"
              placeholderTextColor={COLORS.text.dimmed}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!actionLoading}
            />
          </View>
          <Text className="text-xs italic mb-6 pl-1 pr-1" style={{ color: COLORS.text.dimmed }}>
            Sin + ni espacios. Bolivia: 591 + número. Argentina: 54 + area +
            numero
          </Text>

          <TouchableOpacity
            disabled={actionLoading || phoneNumber.length < 7}
            onPress={onRequestPairing}
            className={`w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg ${
              phoneNumber.length >= 7
                ? "bg-primary shadow-primary/20"
                : "bg-dark-300"
            }`}
          >
            {actionLoading ? (
              <ActivityIndicator color={COLORS.text.primary} />
            ) : (
              <Text className="text-white font-bold text-lg">Obtener codigo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Info Card Pair */}
      <View className="bg-dark-100 p-6 rounded-3xl mt-8 border border-dark-300">
        <View className="flex-row items-center mb-6">
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary.light} />
          <Text className="text-primary-light font-bold text-lg ml-2">
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
              <View className="w-8 h-8 rounded-full bg-dark-200 items-center justify-center mr-4 border border-dark-400">
                <Text className="text-primary font-bold text-xs">{index + 1}</Text>
              </View>
              <Text className="font-medium flex-1 text-sm" style={{ color: COLORS.text.primary }}>
                {paso}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
