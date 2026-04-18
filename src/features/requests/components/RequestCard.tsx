import React, { useState } from "react";
import { View, Text, Alert, Modal, ScrollView } from "react-native";
import { Card, Badge, CustomButton, InputField } from "@/src/components/ui";
import { useTattooStore, type Request } from "@/src/store/useTattooStore";

// ─── Mapeo de estados a variantes de Badge ─────────────────────────────────

const statusBadge: Record<Request["status"], { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  quoted: { label: "Cotizada", variant: "info" },
  accepted: { label: "Aceptada", variant: "success" },
  rejected: { label: "Rechazada", variant: "danger" },
};

// ─── Componente ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  request: Request;
}

/**
 * Card individual para cada solicitud de WhatsApp.
 * Permite cotizar y ver detalles.
 */
export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [price, setPrice] = useState("");
  const quoteRequest = useTattooStore((state) => state.quoteRequest);

  const badge = statusBadge[request.status];

  const handleQuote = () => {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Error", "Ingresa un precio válido.");
      return;
    }
    quoteRequest(request.id, numericPrice);
    setShowQuoteModal(false);
    setPrice("");
  };

  return (
    <>
      <Card className="mb-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white font-bold text-base flex-1">
            {request.clientName}
          </Text>
          <Badge label={badge.label} variant={badge.variant} />
        </View>

        {/* Info */}
        <Text className="text-muted text-sm mb-1">
          📱 {request.clientPhone}
        </Text>
        <Text className="text-muted-light text-sm mb-1">
          {request.description}
        </Text>
        <Text className="text-muted text-xs">
          📍 {request.bodyPart} · 📐 {request.size}
        </Text>

        {/* Precio cotizado */}
        {request.quotedPrice !== null && (
          <View className="mt-2 bg-gold/10 rounded-lg px-3 py-2">
            <Text className="text-gold font-bold text-base">
              💰 ${request.quotedPrice.toLocaleString()}
            </Text>
          </View>
        )}

        {/* Acciones */}
        {request.status === "pending" && (
          <View className="mt-3">
            <CustomButton
              title="Cotizar"
              variant="primary"
              size="sm"
              fullWidth
              onPress={() => setShowQuoteModal(true)}
            />
          </View>
        )}
      </Card>

      {/* Modal de cotización */}
      <Modal
        visible={showQuoteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuoteModal(false)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <View className="bg-dark-100 rounded-2xl p-6 w-full border border-dark-300">
            <Text className="text-white text-xl font-bold mb-4 text-center">
              Cotizar Solicitud
            </Text>
            <Text className="text-muted text-sm mb-4 text-center">
              {request.clientName} — {request.description}
            </Text>

            <InputField
              label="Precio ($)"
              placeholder="Ej: 150000"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <View className="flex-row gap-3 mt-2">
              <View className="flex-1">
                <CustomButton
                  title="Cancelar"
                  variant="ghost"
                  onPress={() => setShowQuoteModal(false)}
                  fullWidth
                />
              </View>
              <View className="flex-1">
                <CustomButton
                  title="Enviar"
                  variant="primary"
                  onPress={handleQuote}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
