import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import type { Cita } from "../types";
import { COLORS } from "../../../theme/colors";

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
      style={[
        {
          backgroundColor: COLORS.dark[100],
          borderColor: COLORS.dark[200],
          borderWidth: 1,
        },
        style,
      ]}
      className="flex-row rounded-2xl overflow-hidden"
    >
      <View style={{ width: 6, backgroundColor: COLORS.primary.DEFAULT }} />
      <View className="flex-1 p-3">
        <Text style={{ color: COLORS.text.primary }} className="font-bold text-base mb-1" numberOfLines={1}>
          {cita.cliente?.nombre ?? cita.clienteNombre ?? "Sin cliente"}
        </Text>
        <View className="flex-row items-center mb-2">
          <Feather name="clock" size={12} color={COLORS.text.secondary} />
          <Text style={{ color: COLORS.text.muted }} className="text-xs ml-1.5">
            {horaInicio} — {horaFin}
          </Text>
        </View>
        <View className="flex-row gap-2 flex-wrap">
          {tipo ? (
            <View style={{ backgroundColor: COLORS.primary.ghost }} className="px-2.5 py-1 rounded-full">
              <Text style={{ color: COLORS.primary.light }} className="text-[10px] font-bold tracking-wider">
                {tipo}
              </Text>
            </View>
          ) : null}
          {duracion ? (
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }} className="px-2.5 py-1 rounded-full">
              <Text style={{ color: COLORS.text.secondary }} className="text-[10px] font-bold tracking-wider">
                {duracion}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
