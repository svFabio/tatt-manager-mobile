import api from './axios';

export const PagosAPI = {
  /** Pagos con comprobante recibido pero sin validar */
  getPendientes: () => api.get<{ data: PagoComprobante[]; error: null }>('/pagos/pendientes'),
  /** Aprobar comprobante y confirmar cita */
  confirmar: (id: number) => api.patch(`/pagos/${id}/confirmar`),
  /** Rechazar comprobante (opcionalmente con motivo) */
  rechazar: (id: number, motivo?: string) => api.patch(`/pagos/${id}/rechazar`, { motivo }),
};

export interface PagoComprobante {
  id: number;
  monto: number;
  fotoComprobanteUrl: string;
  registradoEn: string;
  expiradoEn: string | null;
  estadoValidacion: 'PENDIENTE_VALIDACION' | 'APROBADO' | 'RECHAZADO';
  cliente: { id: number; nombre: string; numeroWhatsapp: string };
  cita: { id: number; fechaHoraInicio: string | null; tipoCita: string } | null;
}
