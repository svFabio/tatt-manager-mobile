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
          const tieneCitas = (citasPorDia.get(key)?.length ?? 0) > 0;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelectDay(dia)}
              activeOpacity={0.7}
              className="items-center justify-center py-2"
              style={{ width: `${100 / 7}%` }}
            >
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  esSeleccionado
                    ? "bg-primary"
                    : esHoy
                    ? "border border-primary"
                    : ""
                }`}
              >
                <Text
                  className={`text-sm ${
                    !enMes
                      ? "text-dark-300"
                      : esSeleccionado
                      ? "text-white font-bold"
                      : esHoy
                      ? "text-primary font-bold"
                      : "text-white"
                  }`}
                >
                  {format(dia, "d")}
                </Text>
              </View>
              <View className="h-1.5 mt-1 items-center justify-center">
                {tieneCitas && enMes && !esSeleccionado ? (
                  <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
