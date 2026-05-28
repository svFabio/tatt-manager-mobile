import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { socket } from "@/src/api/socket";
import { useTattooStore, Request } from "@/src/store/useTattooStore";

export function useWebSocket(): void {
  const socketRef = useRef<Socket | null>(null);
  const addRequest = useTattooStore((state) => state.addRequest);

  useEffect(() => {
    socketRef.current = socket;

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Error de conexión:", error.message);
    });

    const handleNewRequest = (data: Partial<Request>) => {
      if (!data.clientName || !data.id) {
        return;
      }
      addRequest(data as Request);
    };

    socket.on("new-whatsapp-request", handleNewRequest);
    socket.on("nueva-solicitud", handleNewRequest);

    return () => {
      socket.off("new-whatsapp-request", handleNewRequest);
      socket.off("nueva-solicitud", handleNewRequest);
      socketRef.current = null;
    };
  }, [addRequest]);
}
