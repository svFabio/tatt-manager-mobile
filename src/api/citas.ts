import api from "./axios";
import type { SolicitudItem, CitaItem, CitaDetails, EstadoCita } from "../types/citas";

type ApiResponse<T> = { ok: boolean; data: T };
type ListResponse<T> = ApiResponse<T> & { count: number };

const BASE = "/citas";

type RawApiResponse<T> = T | { ok?: boolean; data?: T };

const unwrapData = <T>(payload: RawApiResponse<T>): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        const value = (payload as { data?: T }).data;
        if (value !== undefined) return value;
    }
    return payload as T;
};

const normalizeDetalle = (id: number, raw: Record<string, unknown>): CitaDetails => ({
    id: Number(raw.id ?? id),
    negocioId: Number(raw.negocioId ?? 0),
    fechaHoraInicio: (raw.fechaHoraInicio as string | Date) ?? new Date().toISOString(),
    recibido: (raw.recibido as string | Date) ?? new Date().toISOString(),
    referencia: (raw.referencia as string) ?? (raw.fotoReferenciaUrl as string) ?? "",
    zona: (raw.zona as string) ?? (raw.zonaDelCuerpo as string) ?? "—",
    tamano: (raw.tamano as string) ?? (raw.tamanoEnCm as string) ?? "—",
    clienteNombre: (raw.clienteNombre as string) ?? (raw.nombre as string) ?? "Sin nombre",
    artistaNombre: (raw.artistaNombre as string) ?? "Sin asignar",
});

export const CitasAPI = {
    
    //RETORNA TODAS LAS SOLICITUDES DE CITA, INDEPENDIENTEMENTE DE SU ESTADO
    getSolicitudes: async (): Promise<ListResponse<SolicitudItem[]>> => {
        return api
            .get<ListResponse<SolicitudItem[]>>(`/solicitudes`)
            .then((r) => r.data);
    },

    //RETORNA TODAS LAS CITAS FILTRADAS POR ESTADO, SI SE PROPORCIONA UN ESTADO VÁLIDO
    getCitasPorEstado: (estado: EstadoCita): Promise<ApiResponse<CitaItem[]>> =>
        api.get<ApiResponse<CitaItem[]>>(`${BASE}/por-estado`, { params: { estado } }).then((r) => r.data),

    //RETORNA LOS DETALLES COMPLETOS DE UNA CITA ESPECÍFICA IDENTIFICADA POR SU ID
    getDetalleCita: async (id: number): Promise<ApiResponse<CitaDetails>> => {
        try {
            const detalleRes = await api.get<RawApiResponse<Record<string, unknown>>>(`/solicitudes/${id}`);
            const detalle = normalizeDetalle(id, unwrapData(detalleRes.data));
            return { ok: true, data: detalle };
        } catch {
            const detalleRes = await api.get<RawApiResponse<Record<string, unknown>>>(`${BASE}/${id}/detalle`);
            const detalle = normalizeDetalle(id, unwrapData(detalleRes.data));
            return { ok: true, data: detalle };
        }
    },
} as const;
