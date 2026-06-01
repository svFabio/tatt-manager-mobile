import React from "react";
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import type { StyleProp, ViewStyle } from "react-native";
import type { Cita } from "../types";
import { COLORS } from "../../../theme/colors";

interface EventCardProps {
  cita: Cita;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function formatDuracion(horas: number | string | null | undefined): string {
  if (horas == null) return "";
  const h = typeof horas === "string" ? parseFloat(horas) : horas;
  if (!Number.isFinite(h) || h <= 0) return "";
  if (Number.isInteger(h)) return `${h} HRS`;
  return `${h.toFixed(1)} HRS`;
}

const CARD_COLORS = [
  { main: '#7b61ff', light: '#b19dff', ghost: 'rgba(123, 97, 255, 0.15)' }, // Purple (default)
  { main: '#34d399', light: '#6ee7b7', ghost: 'rgba(52, 211, 153, 0.15)' }, // Emerald
  { main: '#fbbf24', light: '#fcd34d', ghost: 'rgba(251, 191, 36, 0.15)' }, // Amber
  { main: '#f43f5e', light: '#fb7185', ghost: 'rgba(244, 63, 94, 0.15)' },  // Rose
  { main: '#38bdf8', light: '#7dd3fc', ghost: 'rgba(56, 189, 248, 0.15)' }, // Sky Blue
  { main: '#f472b6', light: '#f9a8d4', ghost: 'rgba(244, 114, 182, 0.15)' },// Pink
];

export const EventCard: React.FC<EventCardProps> = ({ cita, onPress, style }) => {
  const inicio = cita.fechaHoraInicio ? new Date(cita.fechaHoraInicio) : null;
  const fin = cita.fechaHoraFin ? new Date(cita.fechaHoraFin) : null;
  const horaInicio = inicio ? format(inicio, "hh:mm a") : "--:--";
  const horaFin = fin ? format(fin, "hh:mm a") : "--:--";

  const tipo = (cita.tipoCita || "").toUpperCase();
  const duracion = formatDuracion(cita.duracionEnHoras);

  // Pick color based on client id (or cita id as fallback) so it's consistent
  const colorIndex = (cita.clienteId || cita.id || 0) % CARD_COLORS.length;
  const themeColor = CARD_COLORS[colorIndex];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={style}
      className="flex-row rounded-2xl overflow-hidden bg-dark-100 border border-dark-200"
    >
      <View style={{ width: 6, backgroundColor: themeColor.main }} />
      <View className="flex-1 p-3">
        <Text className="text-text-primary font-bold text-base mb-1" numberOfLines={1}>
          {cita.cliente?.nombre ?? cita.clienteNombre ?? "Sin cliente"}
        </Text>
        <View className="flex-row items-center mb-2">
          <Feather name="clock" size={12} color={COLORS.text.secondary} />
          <Text className="text-text-muted text-xs ml-1.5">
            {horaInicio} — {horaFin}
          </Text>
        </View>
        <View className="flex-row gap-2 flex-wrap">
          {tipo ? (
            <View style={{ backgroundColor: themeColor.ghost }} className="px-2.5 py-1 rounded-full">
              <Text style={{ color: themeColor.light }} className="text-[10px] font-bold tracking-wider">
                {tipo}
              </Text>
            </View>
          ) : null}
          {duracion ? (
            <View className="bg-white/10 px-2.5 py-1 rounded-full">
              <Text className="text-text-secondary text-[10px] font-bold tracking-wider">
                {duracion}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
