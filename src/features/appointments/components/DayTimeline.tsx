import React, { useEffect, useState } from "react";
import { View, ScrollView } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { EventCard } from "./EventCard";
import { COLORS } from "@/src/theme/colors";
import type { Cita } from "../types";

const LIMITE_HORAS = 8;

interface CargaArtista {
  artistaId: number;
  nombre: string;
  horas: number;
}

function calcularCargaPorArtista(citas: Cita[]): CargaArtista[] {
  const mapa = new Map<number, CargaArtista>();
  for (const cita of citas) {
    const id = cita.artistaId ?? cita.artista?.id;
    if (id == null) continue;
    const nombre = cita.artista?.nombre ?? cita.artistaNombre ?? `Artista ${id}`;
    const horas = Number(cita.duracionEnHoras ?? 0);
    if (mapa.has(id)) {
      mapa.get(id)!.horas += horas;
    } else {
      mapa.set(id, { artistaId: id, nombre, horas });
    }
  }
  return Array.from(mapa.values());
}

function WorkloadBar({ artista }: { artista: CargaArtista }) {
  const porcentaje = Math.min(1, artista.horas / LIMITE_HORAS);
  const excedido = artista.horas > LIMITE_HORAS;
  const barColor = excedido
    ? COLORS.danger.DEFAULT
    : artista.horas >= LIMITE_HORAS * 0.75
    ? COLORS.warning.DEFAULT
    : COLORS.primary.DEFAULT;

  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
        <Text style={{ color: COLORS.text.muted, fontSize: 10, fontWeight: "700" }} numberOfLines={1}>
          {artista.nombre}
        </Text>
        <Text style={{ color: excedido ? COLORS.danger.text : COLORS.text.dimmed, fontSize: 10, fontWeight: "700" }}>
          {artista.horas}h / {LIMITE_HORAS}h
        </Text>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: COLORS.dark[200] }}>
        <View
          style={{
            height: 5,
            borderRadius: 3,
            width: `${porcentaje * 100}%`,
            backgroundColor: barColor,
          }}
        />
      </View>
      {excedido && (
        <Text style={{ color: COLORS.danger.text, fontSize: 9, fontWeight: "700", marginTop: 2 }}>
          LÍMITE SUPERADO
        </Text>
      )}
    </View>
  );
}

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

  const cargaPorArtista = calcularCargaPorArtista(citas);

  return (
    <View className="flex-1">
      <Text className="text-primary text-xs font-bold tracking-widest text-center py-3">
        {tituloDia}
      </Text>

      {cargaPorArtista.length > 0 && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            padding: 12,
            borderRadius: 12,
            backgroundColor: COLORS.dark[100],
            borderWidth: 1,
            borderColor: COLORS.border.subtle,
            gap: 10,
          }}
        >
          {cargaPorArtista.map((a) => (
            <WorkloadBar key={a.artistaId} artista={a} />
          ))}
        </View>
      )}

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
              <View className="flex-1 h-px bg-dark-200" />
            </View>
          ))}


          {/* Contenedor de Citas con Swimlanes (Columnas paralelas) */}
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 56, right: 4 }}>
            {(() => {
              // Extraer IDs únicos de artistas que tienen citas este día
              const artistIds = Array.from(
                new Set(citas.map((c) => c.artistaId ?? c.artista?.id).filter((id) => id != null))
              );
              const numColumns = Math.max(1, artistIds.length);
              const colWidth = 100 / numColumns;

              return citas.map((cita) => {
                if (!cita.fechaHoraInicio) return null;
                const inicio = new Date(cita.fechaHoraInicio);
                const fin = cita.fechaHoraFin
                  ? new Date(cita.fechaHoraFin)
                  : new Date(inicio.getTime() + 60 * 60 * 1000);

                const top = (minutosDesdeInicio(inicio) / 60) * ALTO_HORA;
                const duracionMin = Math.max(30, (fin.getTime() - inicio.getTime()) / 60000);
                const alto = (duracionMin / 60) * ALTO_HORA - 6;

                if (top < 0 || top > altoTotal) return null;

                // Determinar en qué columna va esta cita
                const artistaId = cita.artistaId ?? cita.artista?.id;
                let colIndex = artistaId != null ? artistIds.indexOf(artistaId) : -1;
                if (colIndex === -1) colIndex = 0; // Fallback

                return (
                  <View
                    key={cita.id}
                    style={{
                      position: "absolute",
                      top,
                      left: `${colIndex * colWidth}%`,
                      width: `${colWidth}%`,
                      height: alto,
                      zIndex: 1,
                      paddingHorizontal: 2, // Pequeño espacio entre columnas
                    }}
                  >
                    <EventCard
                      cita={cita}
                      onPress={() => onSelectCita(cita)}
                      style={{ flex: 1 }}
                    />
                  </View>
                );
              });
            })()}
          </View>

          {/* Current time indicator — rendered LAST so it's visually on top */}
          {offsetAhora != null ? (
            <View
              style={{
                position: "absolute",
                top: offsetAhora,
                left: 48,
                right: 0,
                flexDirection: "row",
                alignItems: "center",
                zIndex: 10,
              }}
              pointerEvents="none"
            >
              <View className="w-2.5 h-2.5 rounded-full bg-alert" />
              <View className="flex-1 h-[2px] bg-alert" />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};
