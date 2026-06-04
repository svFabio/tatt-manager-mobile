import React, { useEffect, useState } from "react";
import {
  View, Modal, TouchableOpacity, ActivityIndicator, ScrollView, Image, } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { fetchCitaDetalle } from "../api/calendarApi";
import type { Cita, CitaDetalle } from "../types";
import { COLORS } from "../../../theme/colors";

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
    <View className="flex-row py-2.5 border-b border-dark-200">
      <View className="w-8 items-center justify-center mt-0.5">
        <Feather name={icon} size={16} color={COLORS.primary.DEFAULT} />
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
  const [imageExpanded, setImageExpanded] = useState(false);

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
      } catch (e: unknown) {
        if (!cancelado) setError((e instanceof Error ? e.message : null) ?? 'Error al cargar detalle');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [cita, visible]);

  const handleClose = () => {
    setImageExpanded(false);
    onClose();
  };

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
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/70 justify-center px-5">
        <View className="bg-dark-100 rounded-3xl border border-dark-200 overflow-hidden max-h-[85%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-dark-200">
            <Text className="text-white text-lg font-bold">Detalle de cita</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 rounded-full bg-dark-200 items-center justify-center"
            >
              <Feather name="x" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-10 items-center">
              <ActivityIndicator color={COLORS.primary.DEFAULT} />
              <Text className="text-muted text-sm mt-2">Cargando…</Text>
            </View>
          ) : error ? (
            <View className="py-10 items-center px-6">
              <Feather name="alert-circle" size={28} color={COLORS.danger.DEFAULT} />
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

              {detalle.referencia ? (
                <View className="mt-4">
                  <Text className="text-muted-dark text-[11px] font-semibold tracking-wider uppercase mb-2">
                    Referencia
                  </Text>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setImageExpanded(true)}>
                    <Image
                      source={{ uri: detalle.referencia }}
                      style={{ width: "100%", height: 180, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-2 right-2 bg-black/50 rounded-lg px-2 py-1 flex-row items-center">
                      <Feather name="maximize" size={12} color="white" />
                      <Text className="text-white text-[10px] ml-1 font-semibold">Ampliar</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
          ) : null}
        </View>
      </View>

      {/* Fullscreen image modal */}
      <Modal
        visible={imageExpanded}
        transparent
        animationType="fade"
        onRequestClose={() => setImageExpanded(false)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity
            onPress={() => setImageExpanded(false)}
            className="absolute top-14 right-5 z-10 w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Feather name="x" size={22} color="white" />
          </TouchableOpacity>
          {detalle?.referencia ? (
            <Image
              source={{ uri: detalle.referencia }}
              style={{ width: "95%", height: "70%" }}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </Modal>
  );
};
