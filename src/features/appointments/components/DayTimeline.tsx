import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { EventCard } from "./EventCard";
import type { Cita } from "../types";

interface DayTimelineProps {
  dia: Date;
  citas: Cita[];
  onSelectCita: (cita: Cita) => void;
}

const HORA_INICIO = 8;
const HORA_FIN = 20;
const ALTO_HORA = 100;

function minutosDesdeInicio(fecha: Date): number {
  return (fecha.getHours() - HORA_INICIO) * 60 + fecha.getMinutes();
}

function horasDelDia(): number[] {
  const out: number[] = [];
  for (let h = HORA_INICIO; h <= HORA_FIN; h++) out.push(h);
  return out;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({ dia, citas, onSelectCita }) => {
  const [ahora, setAhora] = useState<Date>(new Date());

  useEffect(() => {
    const tick = setInterval(() => setAhora(new Date()), 60 * 1000);
    return () => clearInterval(tick);
  }, []);

  const esHoy = isSameDay(dia, ahora);
  const tituloDia = format(dia, "EEEE d 'DE' MMMM", { locale: es }).toUpperCase();
  const horas = horasDelDia();
  const altoTotal = (HORA_FIN - HORA_INICIO) * ALTO_HORA;

  const offsetAhora =
    esHoy &&
    ahora.getHours() >= HORA_INICIO &&
    ahora.getHours() <= HORA_FIN
      ? (minutosDesdeInicio(ahora) / 60) * ALTO_HORA
      : null;

  return (
    <View className="flex-1">
      <Text className="text-[#7E51FF] text-xs font-bold tracking-widest text-center py-3">
        {tituloDia}
      </Text>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: altoTotal, position: "relative" }} className="mx-4">
          
          {horas.map((h, idx) => (
            <View
              key={h}
              style={{
                position: "absolute",
                top: idx * ALTO_HORA,
                left: 0,
                right: 0,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text className="text-muted-dark text-xs w-12">
                {`${String(h).padStart(2, "0")}:00`}
              </Text>
              <View className="flex-1 h-px bg-[#2A2A2A]" />
            </View>
          ))}

        
          {offsetAhora != null ? (
            <View
              style={{
                position: "absolute",
                top: offsetAhora,
                left: 48,
                right: 0,
                flexDirection: "row",
                alignItems: "center",
              }}
              pointerEvents="none"
            >
              <View className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" />
              <View className="flex-1 h-[2px] bg-[#FF3B30]" />
            </View>
          ) : null}

          
          {citas.map((cita) => {
            if (!cita.fechaHoraInicio) return null;
            const inicio = new Date(cita.fechaHoraInicio);
            const fin = cita.fechaHoraFin
              ? new Date(cita.fechaHoraFin)
              : new Date(inicio.getTime() + 60 * 60 * 1000);

            const top = (minutosDesdeInicio(inicio) / 60) * ALTO_HORA;
            const duracionMin = Math.max(
              30,
              (fin.getTime() - inicio.getTime()) / 60000
            );
            const alto = (duracionMin / 60) * ALTO_HORA - 6;

            if (top < 0 || top > altoTotal) return null;

            return (
              <View
                key={cita.id}
                style={{
                  position: "absolute",
                  top,
                  left: 56,
                  right: 4,
                  height: alto,
                }}
              >
                <EventCard
                  cita={cita}
                  onPress={() => onSelectCita(cita)}
                  style={{ flex: 1 }}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
