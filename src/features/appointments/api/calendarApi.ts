import api from "@/src/api/axios";
import { format } from "date-fns";
import type { Cita, CitaDetalle } from "../types";

export async function fetchCitasEnRango(
  desde: Date,
  hasta: Date
): Promise<Cita[]> {
  const { data } = await api.get<Cita[]>("/citas", {
    params: {
      desde: format(desde, "yyyy-MM-dd"),
      hasta: format(hasta, "yyyy-MM-dd"),
    },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchCitaDetalle(id: number): Promise<CitaDetalle> {
  const { data } = await api.get<{ ok: boolean; data: CitaDetalle }>(
    `/citas/${id}/detalle`
  );
  return data.data;
}
