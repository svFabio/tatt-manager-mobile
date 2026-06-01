import { useCallback } from "react";
import { useTattooStore } from "@/src/store/useTattooStore";
import api from "@/src/api/axios";

/**
 * Hook para manejar la lógica de negocio de las solicitudes.
 * Separa la lógica de la UI para mantener los componentes limpios.
 */
export function useRequests() {
  const requests = useTattooStore((state) => state.requests);
  const setRequests = useTattooStore((state) => state.setRequests);
  const quoteRequest = useTattooStore((state) => state.quoteRequest);

  /** Carga las solicitudes iniciales desde el backend. */
  const fetchRequests = useCallback(async () => {
    try {
      const response = await api.get("/solicitudes");
      const solicitudesArray = response.data.data || response.data;
      setRequests(Array.isArray(solicitudesArray) ? solicitudesArray : []);
    } catch (error) {
      console.error("[useRequests] Error al cargar solicitudes:", error);
    }
  }, [setRequests]);

  /** Envía una cotización al backend y actualiza el store. */
  const sendQuote = useCallback(
    async (requestId: string, price: number) => {
      try {
        await api.patch(`/solicitudes/${requestId}/cotizar`, { price });
        quoteRequest(requestId, price);
      } catch (error) {
        console.error("[useRequests] Error al cotizar:", error);
        throw error;
      }
    },
    [quoteRequest]
  );

  // Filtros por estado
  const pendingRequests = (requests || []).filter((r) => r.status === "PENDIENTE" || r.status === "pending");
  const quotedRequests = (requests || []).filter((r) => r.status === "COTIZADA" || r.status === "quoted");

  return {
    requests,
    pendingRequests,
    quotedRequests,
    fetchRequests,
    sendQuote,
  };
}
