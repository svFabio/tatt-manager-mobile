import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Cita } from "../types";
import { COLORS } from "../../../theme/colors";

interface MonthGridProps {
  mes: Date;
  diaSeleccionado: Date;
  citasPorDia: Map<string, Cita[]>;
  onSelectDay: (fecha: Date) => void;
}

const DIAS_SEMANA = ["LU", "MA", "MIE", "JUE", "VIE", "SA", "DOM"];

export const MonthGrid: React.FC<MonthGridProps> = ({
  mes,
  diaSeleccionado,
  citasPorDia,
  onSelectDay,
}) => {
  const dias = useMemo(() => {
    const primerDia = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
    const ultimoDia = endOfWeek(endOfMonth(mes), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: primerDia, end: ultimoDia });
  }, [mes]);

  const hoy = new Date();

  return (
    <View className="bg-dark-100 mx-4 mt-4 rounded-2xl border border-dark-200 p-3">
      {/* Encabezado días de la semana */}
      <View className="flex-row mb-2">
        {DIAS_SEMANA.map((d) => (
          <View key={d} className="flex-1 items-center py-2">
            <Text className="text-muted-dark text-[10px] font-bold tracking-wider">
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid de días */}
      <View className="flex-row flex-wrap">
        {dias.map((dia) => {
          const enMes = isSameMonth(dia, mes);
          const esSeleccionado = isSameDay(dia, diaSeleccionado);
          const esHoy = isSameDay(dia, hoy);
          const key = format(dia, "yyyy-MM-dd");
          const numCitas = citasPorDia.get(key)?.length ?? 0;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelectDay(dia)}
              activeOpacity={0.7}
              className="items-center justify-center py-2"
              style={{ width: `${100 / 7}%` }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: esSeleccionado ? COLORS.primary.DEFAULT : 'transparent',
                  borderWidth: !esSeleccionado && esHoy ? 1.5 : 0,
                  borderColor: !esSeleccionado && esHoy ? COLORS.primary.DEFAULT : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: !enMes
                      ? COLORS.dark[300]
                      : esSeleccionado
                      ? '#FFFFFF'
                      : esHoy
                      ? COLORS.primary.DEFAULT
                      : '#FFFFFF',
                    fontWeight: esSeleccionado || esHoy ? '700' : '400',
                  }}
                >
                  {format(dia, "d")}
                </Text>
              </View>
              <View className="h-1.5 mt-1 flex-row items-center justify-center" style={{ gap: 2 }}>
                {enMes && numCitas > 0
                  ? Array.from({ length: Math.min(numCitas, 3) }).map((_, i) => (
                      <View
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: esSeleccionado ? '#FFFFFF' : COLORS.primary.DEFAULT }}
                      />
                    ))
                  : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
