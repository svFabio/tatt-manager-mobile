import api from "./axios";
import type { SolicitudItem, CitaItem, CitaDetails, EstadoCita } from "../types/citas";

type ApiResponse<T> = { ok: boolean; data: T };
type ListResponse<T> = ApiResponse<T> & { count: number };

const BASE = "/citas";

export const CitasAPI = {
    
    //RETORNA TODAS LAS SOLICITUDES DE CITA, INDEPENDIENTEMENTE DE SU ESTADO
    getSolicitudes: (): Promise<ListResponse<SolicitudItem[]>> =>
        api.get<ListResponse<SolicitudItem[]>>(`${BASE}/solicitudes`).then((r) => r.data),

    //RETORNA TODAS LAS CITAS FILTRADAS POR ESTADO, SI SE PROPORCIONA UN ESTADO VÁLIDO
    getCitasPorEstado: (estado: EstadoCita): Promise<ApiResponse<CitaItem[]>> =>
        api.get<ApiResponse<CitaItem[]>>(`${BASE}/por-estado`, { params: { estado } }).then((r) => r.data),

    //RETORNA LOS DETALLES COMPLETOS DE UNA CITA ESPECÍFICA IDENTIFICADA POR SU ID
    getDetalleCita: (id: number): Promise<ApiResponse<CitaDetails>> =>
        api.get<ApiResponse<CitaDetails>>(`${BASE}/${id}/detalle`).then((r) => r.data),
} as const;
