import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { fetchCitaDetalle } from "../api/calendarApi";
import type { Cita, CitaDetalle } from "../types";

interface AppointmentDetailModalProps {
  cita: Cita | null;
  visible: boolean;
  onClose: () => void;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row py-2.5 border-b border-[#2A2A2A]">
      <View className="w-8 items-center justify-center mt-0.5">
        <Feather name={icon} size={16} color="#7E51FF" />
      </View>
      <View className="flex-1">
        <Text className="text-muted-dark text-[11px] font-semibold tracking-wider uppercase">
          {label}
        </Text>
        <Text className="text-white text-sm mt-0.5">{value}</Text>
      </View>
    </View>
  );
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  cita,
  visible,
  onClose,
}) => {
  const [detalle, setDetalle] = useState<CitaDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      if (!cita || !visible) return;
      setLoading(true);
      setError(null);
      setDetalle(null);
      try {
        const d = await fetchCitaDetalle(cita.id);
        if (!cancelado) setDetalle(d);
      } catch (e: any) {
        if (!cancelado) setError(e?.message || "Error al cargar detalle");
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [cita, visible]);

  const fechaFormateada =
    detalle?.fechaHoraInicio &&
    format(new Date(detalle.fechaHoraInicio), "EEEE d 'de' MMMM yyyy", {
      locale: es,
    });
  const horaFormateada =
    detalle?.fechaHoraInicio &&
    format(new Date(detalle.fechaHoraInicio), "hh:mm a");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 justify-center px-5">
        <View className="bg-[#1A1A1A] rounded-3xl border border-[#2A2A2A] overflow-hidden max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
            <Text className="text-white text-lg font-bold">Detalle de cita</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-[#2A2A2A] items-center justify-center"
            >
              <Feather name="x" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-10 items-center">
              <ActivityIndicator color="#7E51FF" />
              <Text className="text-muted text-sm mt-2">Cargando…</Text>
            </View>
          ) : error ? (
            <View className="py-10 items-center px-6">
              <Feather name="alert-circle" size={28} color="#FF3B30" />
              <Text className="text-white text-sm mt-3 text-center">{error}</Text>
            </View>
          ) : detalle ? (
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <InfoRow
                icon="user"
                label="Cliente"
                value={detalle.clienteNombre || "—"}
              />
              <InfoRow
                icon="user-check"
                label="Artista"
                value={detalle.artistaNombre || "—"}
              />
              <InfoRow
                icon="calendar"
                label="Fecha"
                value={fechaFormateada || "No especificada"}
              />
              <InfoRow
                icon="clock"
                label="Hora"
                value={horaFormateada || "No especificada"}
              />
              <InfoRow
                icon="map-pin"
                label="Zona del cuerpo"
                value={detalle.zona || "No especificada"}
              />
              <InfoRow
                icon="maximize-2"
                label="Tamaño"
                value={detalle.tamano || "No especificado"}
              />
              <InfoRow
                icon="tag"
                label="Estado"
                value={cita?.estadoCita ?? "—"}
              />

              {detalle.referencia && detalle.referencia !== "No especificada" ? (
                <View className="mt-4">
                  <Text className="text-muted-dark text-[11px] font-semibold tracking-wider uppercase mb-2">
                    Referencia
                  </Text>
                  <Image
                    source={{ uri: detalle.referencia }}
                    style={{ width: "100%", height: 180, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};
