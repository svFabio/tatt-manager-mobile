import React from "react";
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { WhatsAppQRCode } from "./WhatsAppQRCode";
import { WhatsAppPairCode } from "./WhatsAppPairCode";
import { COLORS } from "@/src/theme/colors";

export type ConnectionMethod = "qr" | "pair";

interface WhatsAppLinkerProps {
  method: ConnectionMethod;
  setMethod: (method: ConnectionMethod) => void;
  // Para QR
  qrValor: string | null;
  onRegenerate: () => void;
  // Para Pair
  pairingCode: string | null;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  onRequestPairing: () => void;
  onResetPairing: () => void;
  // Global
  actionLoading: boolean;
}

export const WhatsAppLinker: React.FC<WhatsAppLinkerProps> = ({
  method,
  setMethod,
  qrValor,
  onRegenerate,
  pairingCode,
  phoneNumber,
  setPhoneNumber,
  onRequestPairing,
  onResetPairing,
  actionLoading,
}) => {
  return (
    <View>
      <View className="mb-8 mt-2">
        <Text className="text-base text-text-secondary">
          Elige como conectar tu numero al bot
        </Text>
      </View>

      <View>
        {/* TABS Píldora */}
        <View className="flex-row bg-dark-100 p-1.5 rounded-2xl mb-8 border border-dark-300">
          <TouchableOpacity
            onPress={() => setMethod("qr")}
            className={`flex-1 py-3 rounded-xl items-center ${
              method === "qr" ? "bg-primary" : ""
            }`}
          >
            <Text
              className={`font-bold ${method === "qr" ? "text-text-primary" : "text-text-muted"}`}
            >
              Codigo QR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMethod("pair")}
            className={`flex-1 py-3 rounded-xl items-center ${
              method === "pair" ? "bg-primary" : ""
            }`}
          >
            <Text
              className={`font-bold ${method === "pair" ? "text-text-primary" : "text-text-muted"}`}
            >
              Codigo de texto
            </Text>
          </TouchableOpacity>
        </View>

        {method === "qr" ? (
          <WhatsAppQRCode
            qrValor={qrValor}
            onRegenerate={onRegenerate}
            actionLoading={actionLoading}
          />
        ) : (
          <WhatsAppPairCode
            pairingCode={pairingCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onRequestPairing={onRequestPairing}
            onResetPairing={onResetPairing}
            actionLoading={actionLoading}
          />
        )}
      </View>
    </View>
  );
};
