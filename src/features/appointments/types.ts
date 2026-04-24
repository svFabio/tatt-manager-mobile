export type EstadoCita =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "FINALIZADA"
  | "CANCELADA";

export interface ClienteBasico {
  id: number;
  nombre: string;
  numeroWhatsapp?: string;
}

export interface ArtistaBasico {
  id: number;
  nombre: string;
}

export interface Cita {
  id: number;
  negocioId: number;
  fechaHoraInicio: string | null;
  fechaHoraFin: string | null;
  duracionEnHoras: number | string | null;
  tipoCita: string;
  estadoCita: EstadoCita;
  estiloDeTatuaje: string | null;
  zonaDelCuerpo: string | null;
  descripcion: string | null;
  seniaPagada: number | string;
  creadoEn: string;
  clienteId: number | null;
  cliente?: ClienteBasico | null;
  artistaId: number | null;
  artista?: ArtistaBasico | null;
}

export interface CitaDetalle {
  id: number;
  negocioId: number;
  fechaHoraInicio: string | null;
  recibido: string | null;
  referencia: string | null;
  zona: string | null;
  tamano: string | null;
  clienteNombre: string;
  artistaNombre: string;
}

export type VistaCalendario = "month" | "day";
