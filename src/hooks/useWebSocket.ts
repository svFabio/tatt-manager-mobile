import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useTattooStore, Request } from "@/src/store/useTattooStore";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL!;

export function useWebSocket(): void {
  const socketRef = useRef<Socket | null>(null);
  const addRequest = useTattooStore((state) => state.addRequest);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

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

    socket.on("new-whatsapp-request", (data: Request) => {
      console.log("[WebSocket] Nueva solicitud recibida:", data.clientName);
      addRequest(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      console.log("[WebSocket] Socket desconectado (cleanup).");
    };
  }, [addRequest]);
}
