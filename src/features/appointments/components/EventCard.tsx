import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import type { Cita } from "../types";

interface EventCardProps {
  cita: Cita;
  onPress?: () => void;
  style?: any;
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
      className="flex-row bg-dark-100 rounded-2xl overflow-hidden border border-dark-200 "
    >
      <View className="w-1.5 bg-primary" />
      <View className="flex-1 p-3 ">
        <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
          {cita.cliente?.nombre ?? cita.clienteNombre ?? "Sin cliente"}
        </Text>
        <View className="flex-row items-center mb-2">
          <Feather name="clock" size={12} color="#9CA3AF" />
          <Text className="text-muted text-xs ml-1.5">
            {horaInicio} — {horaFin}
          </Text>
        </View>
        <View className="flex-row gap-2 flex-wrap ">
          {tipo ? (
            <View className="px-2.5 py-1 rounded-full bg-primary/20">
              <Text className="text-primary-light text-[10px] font-bold tracking-wider">
                {tipo}
              </Text>
            </View>
          ) : null}
          {duracion ? (
            <View className="px-2.5 py-1 rounded-full bg-info/20">
              <Text className="text-info-light text-[10px] font-bold tracking-wider">
                {duracion}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
