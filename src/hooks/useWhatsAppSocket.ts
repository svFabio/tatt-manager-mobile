import { useEffect, useState } from "react";
import { socket, joinNegocioRoom } from "../api/socket";
import { WhatsAppAPI } from "../api/whatsapp";

type WhatsAppState = {
  conectado: boolean;
  qr: string | null;
  activo: boolean;
  reiniciando?: boolean;
};

export const useWhatsAppSocket = (negocioId: number = 1) => {
  const [wsState, setWsState] = useState<WhatsAppState>({
    conectado: false,
    qr: null,
    activo: false,
  });
  const [loading, setLoading] = useState(true);

  // 1. Cargar el estado inicial
  const refreshStatus = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await WhatsAppAPI.getStatus();
      setWsState({
        conectado: data.conectado,
        qr: data.qr,
        activo: data.activo,
      });
    } catch (error) {
      console.error("Error obteniendo estado de WP", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ Fix 2: Unirse al room del negocio para recibir solo sus eventos
    joinNegocioRoom(negocioId);
    refreshStatus();

    const eventName = `whatsapp-status-${negocioId}`;

    const handleStatusChange = (data: Partial<WhatsAppState>) => {
      setWsState((prev) => ({ ...prev, ...data }));
    };

    socket.on(eventName, handleStatusChange);

    return () => {
      socket.off(eventName, handleStatusChange);
    };
  }, [negocioId]);

  return { wsState, loading, refreshStatus };
};
