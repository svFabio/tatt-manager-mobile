import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/src/components/ui";
import { type Appointment } from "@/src/store/useTattooStore";
import { COLORS } from "@/src/theme/colors";

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
}

const statusBgColors: Record<Appointment["status"], string> = {
  scheduled: COLORS.status.confirmada.bg,
  "in-progress": COLORS.warning.ghost,
  completed: COLORS.status.confirmada.bg,
  cancelled: COLORS.status.cancelada.bg,
};

const statusDotColors: Record<Appointment["status"], string> = {
  scheduled: COLORS.status.confirmada.text,
  "in-progress": COLORS.warning.text,
  completed: COLORS.status.finalizada.text,
  cancelled: COLORS.status.cancelada.text,
};

const statusLabels: Record<Appointment["status"], string> = {
  scheduled: "Programada",
  "in-progress": "En Curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

/**
 * Card para mostrar una cita en la agenda/calendario.
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
}) => {
  const dateObj = new Date(appointment.date);
  const formattedDate = dateObj.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Card className="mb-3">
      {/* Indicador de estado lateral */}
      <View className="flex-row">
        <View
          className="w-1 rounded-full mr-3"
          style={{ backgroundColor: statusDotColors[appointment.status] }}
        />
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-white font-bold text-base">
              {appointment.clientName}
            </Text>
            <Text className="text-gold text-sm font-semibold">
              ${appointment.price.toLocaleString()}
            </Text>
          </View>

          {/* Horario */}
          <Text className="text-gold-light text-sm font-medium mb-1">
            🗓 {formattedDate} · ⏰ {appointment.startTime} - {appointment.endTime}
          </Text>

          {/* Descripción */}
          <Text className="text-muted text-sm" numberOfLines={2}>
            {appointment.description}
          </Text>

          {/* Estado */}
          <View className="flex-row items-center mt-2">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: statusDotColors[appointment.status] }}
            />
            <Text className="text-muted-light text-xs font-medium">
              {statusLabels[appointment.status]}
            </Text>
          </View>

          {/* Notas */}
          {appointment.notes ? (
            <Text className="text-muted-dark text-xs mt-1 italic">
              📝 {appointment.notes}
            </Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
};
