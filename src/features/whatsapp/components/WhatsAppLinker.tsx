import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WhatsAppQRCode } from "./WhatsAppQRCode";
import { WhatsAppPairCode } from "./WhatsAppPairCode";

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
      <View className="mb-8 mt-4">
        <Text className="text-3xl font-extrabold text-white mb-2 tracking-tight">
          Vincular WhatsApp
        </Text>
        <Text className="text-gray-400 text-base">
          Elige como conectar tu numero al bot
        </Text>
      </View>

      <View>
        {/* TABS Píldora */}
        <View className="flex-row bg-[#1f1f1f] p-1.5 rounded-2xl mb-8 border border-[#2b2b2b]">
          <TouchableOpacity
            onPress={() => setMethod("qr")}
            className={`flex-1 py-3 rounded-xl items-center ${
              method === "qr" ? "bg-[#8b5cf6]" : ""
            }`}
          >
            <Text
              className={`font-bold ${
                method === "qr" ? "text-white" : "text-gray-500"
              }`}
            >
              Codigo QR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMethod("pair")}
            className={`flex-1 py-3 rounded-xl items-center ${
              method === "pair" ? "bg-[#8b5cf6]" : ""
            }`}
          >
            <Text
              className={`font-bold ${
                method === "pair" ? "text-white" : "text-gray-500"
              }`}
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
