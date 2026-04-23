import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { socket } from "@/src/api/socket";
import { useTattooStore, Request } from "@/src/store/useTattooStore";

export function useWebSocket(): void {
  const socketRef = useRef<Socket | null>(null);
  const addRequest = useTattooStore((state) => state.addRequest);

  useEffect(() => {
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WebSocket] Conectado al servidor:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[WebSocket] Desconectado:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Error de conexión:", error.message);
    });

    const handleNewRequest = (data: Partial<Request>) => {
      if (!data.clientName || !data.id) {
        console.log("[WebSocket] Evento nueva-solicitud recibido (payload resumido).");
        return;
      }

      console.log("[WebSocket] Nueva solicitud recibida:", data.clientName);
      addRequest(data as Request);
    };

    socket.on("new-whatsapp-request", handleNewRequest);
    socket.on("nueva-solicitud", handleNewRequest);

    return () => {
      socket.off("new-whatsapp-request", handleNewRequest);
      socket.off("nueva-solicitud", handleNewRequest);
      socketRef.current = null;
      console.log("[WebSocket] Socket desconectado (cleanup).");
    };
  }, [addRequest]);
}
