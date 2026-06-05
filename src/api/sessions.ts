import api from "./axios";

export interface SessionListItem {
  id: number;
  duracionEnHoras: string;
  fotoResultadoUrl: string | null;
  cerradaEn: string;
  artista: { id: number; nombre: string };
  cliente: { id: number; nombre: string };
  cita: { 
    id: number; 
    tipoCita: string; 
    fechaHoraInicio: string | null; 
    zonaDelCuerpo: string | null;
    solicitud?: { zonaDelCuerpo: string | null };
  };
  capsUsadas: {
    id: number;
    tamanioCap: string;
    cantidadUsada: number;
    tinta: { id: number; nombre: string; color: string; colorHex: string; marca: string };
  }[];
  agujasUsadas: {
    id: number;
    cantidadUsada: number;
    aguja: { id: number; nombre: string; marca: string; tipo: string; calibre: string | null };
  }[];
}

export interface SessionDetail extends SessionListItem {
  seniaRecibida: string;
  cobroDelTrabajo: string;
  totalDeLaSesion: string;
  observaciones: string | null;
  negocioId: number;
}

export interface ArtistaOption {
  id: number;
  nombre: string;
}

type ApiResponse<T> = { data: T; error: string | null };

export const SessionsAPI = {
  /** GET /registro-sesion — lista de sesiones finalizadas */
  getAll: async (params?: { artistaId?: number; search?: string }): Promise<ApiResponse<SessionListItem[]>> => {
    return api
      .get<ApiResponse<SessionListItem[]>>("/registro-sesion", { params })
      .then((r) => r.data);
  },

  /** GET /registro-sesion/:id — detalle completo */
  getById: async (id: number): Promise<ApiResponse<SessionDetail>> => {
    return api
      .get<ApiResponse<SessionDetail>>(`/registro-sesion/${id}`)
      .then((r) => r.data);
  },

  /** GET /users — artistas para el filtro */
  getArtistas: async (): Promise<ApiResponse<ArtistaOption[]>> => {
    return api
      .get<ArtistaOption[]>("/users")
      .then((r) => ({ data: r.data, error: null }));
  },
};
