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

export const EventCard: React.FC<EventCardProps> = ({ cita, onPress, style }) => {
  const inicio = cita.fechaHoraInicio ? new Date(cita.fechaHoraInicio) : null;
  const fin = cita.fechaHoraFin ? new Date(cita.fechaHoraFin) : null;
  const horaInicio = inicio ? format(inicio, "hh:mm a") : "--:--";
  const horaFin = fin ? format(fin, "hh:mm a") : "--:--";

  const tipo = (cita.tipoCita || "").toUpperCase();
  const duracion = formatDuracion(cita.duracionEnHoras);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={style}
      className="flex-row rounded-2xl overflow-hidden bg-dark-100 border border-dark-200"
    >
      <View className="w-1.5 bg-primary" />
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
            <View className="bg-primary-ghost px-2.5 py-1 rounded-full">
              <Text className="text-primary-light text-[10px] font-bold tracking-wider">
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
