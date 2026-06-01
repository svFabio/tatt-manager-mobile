import { create } from 'zustand';
import { PagosAPI, PagoComprobante } from '../api/pagos';

interface PagosState {
  pendientes: PagoComprobante[];
  isLoading: boolean;
  error: string | null;
  fetchPendientes: () => Promise<void>;
  confirmarPago: (id: number) => Promise<void>;
  rechazarPago: (id: number, motivo?: string) => Promise<void>;
  // Eliminar optimistamente del estado local (para animaciones)
  _removePendiente: (id: number) => void;
}

export const usePagosStore = create<PagosState>((set, get) => ({
  pendientes: [],
  isLoading: false,
  error: null,

  fetchPendientes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await PagosAPI.getPendientes();
      set({ pendientes: res.data.data ?? [] });
    } catch (e: any) {
      console.error('[usePagosStore] fetchPendientes:', e);
      set({ error: 'No se pudo cargar los comprobantes.' });
    } finally {
      set({ isLoading: false });
    }
  },

  confirmarPago: async (id) => {
    // Eliminación optimista: sacamos la tarjeta de inmediato
    get()._removePendiente(id);
    try {
      await PagosAPI.confirmar(id);
    } catch (e: any) {
      console.error('[usePagosStore] confirmarPago:', e);
      // Si falla, recargamos para restaurar el estado real
      set({ error: 'No se pudo procesar la acción. Inténtalo de nuevo.' });
      await get().fetchPendientes();
      throw e;
    }
  },

  rechazarPago: async (id, motivo) => {
    // Eliminación optimista
    get()._removePendiente(id);
    try {
      await PagosAPI.rechazar(id, motivo);
    } catch (e: any) {
      console.error('[usePagosStore] rechazarPago:', e);
      set({ error: 'No se pudo procesar la acción. Inténtalo de nuevo.' });
      await get().fetchPendientes();
      throw e;
    }
  },

  _removePendiente: (id) =>
    set((state) => ({
      pendientes: state.pendientes.filter((p) => p.id !== id),
    })),
}));
