import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
  isSameDay,
} from "date-fns";
import { fetchCitasEnRango } from "../api/calendarApi";
import type { Cita } from "../types";

function keyDia(fecha: Date): string {
  return format(fecha, "yyyy-MM-dd");
}

export function useCalendar() {
  const [mesActual, setMesActual] = useState<Date>(() => new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date>(() => new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarMes = useCallback(async (mes: Date) => {
    setLoading(true);
    setError(null);
    try {
      const desde = startOfMonth(mes);
      const hasta = endOfMonth(mes);
      const data = await fetchCitasEnRango(desde, hasta);
      setCitas(data);
    } catch (e: any) {
      setError(e?.message || "Error al cargar citas");
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMes(mesActual);
  }, [mesActual, cargarMes]);

  const citasPorDia = useMemo(() => {
    const map = new Map<string, Cita[]>();
    for (const cita of citas) {
      if (!cita.fechaHoraInicio) continue;
      const k = keyDia(new Date(cita.fechaHoraInicio));
      const arr = map.get(k) ?? [];
      arr.push(cita);
      map.set(k, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const ta = a.fechaHoraInicio ? new Date(a.fechaHoraInicio).getTime() : 0;
        const tb = b.fechaHoraInicio ? new Date(b.fechaHoraInicio).getTime() : 0;
        return ta - tb;
      });
    }
    return map;
  }, [citas]);

  const citasDelDia = useMemo(() => {
    return citasPorDia.get(keyDia(diaSeleccionado)) ?? [];
  }, [citasPorDia, diaSeleccionado]);

  const goPrevMonth = useCallback(() => {
    setMesActual((m) => subMonths(m, 1));
  }, []);

  const goNextMonth = useCallback(() => {
    setMesActual((m) => addMonths(m, 1));
  }, []);

  const seleccionarDia = useCallback((fecha: Date) => {
    setDiaSeleccionado(fecha);
    setMesActual((prev) => (isSameDay(prev, fecha) ? prev : fecha));
  }, []);

  const refrescar = useCallback(() => cargarMes(mesActual), [cargarMes, mesActual]);

  return {
    mesActual,
    diaSeleccionado,
    citas,
    citasPorDia,
    citasDelDia,
    loading,
    error,
    goPrevMonth,
    goNextMonth,
    seleccionarDia,
    refrescar,
  };
}
