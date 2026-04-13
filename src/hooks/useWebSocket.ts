import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useTattooStore, Request } from "@/src/store/useTattooStore";

/**
 * URL del servidor de WebSockets (Socket.io).
 * ⬅️ Cambia esto por la dirección de tu servidor backend.
 */
const SOCKET_URL = "http://192.168.1.100:3000";

/**
 * Custom Hook global para conectarse al servidor de Socket.io.
 *
 * Escucha el evento `new-whatsapp-request` y actualiza el store
 * de Zustand en tiempo real cuando llega una nueva solicitud.
 *
 * Uso: Invócalo en el `app/_layout.tsx` para que esté activo
 * durante toda la vida de la aplicación.
 */
export function useWebSocket(): void {
  const socketRef = useRef<Socket | null>(null);
  const addRequest = useTattooStore((state) => state.addRequest);

  useEffect(() => {
    // ── Conectar al servidor ──
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ [WebSocket] Conectado al servidor:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ [WebSocket] Desconectado:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ [WebSocket] Error de conexión:", error.message);
    });

    // ── Escuchar nuevas solicitudes de WhatsApp ──
    socket.on("new-whatsapp-request", (data: Request) => {
      console.log("📩 [WebSocket] Nueva solicitud recibida:", data.clientName);
      addRequest(data);
    });

    // ── Cleanup: Desconectar al desmontar ──
    return () => {
      socket.disconnect();
      socketRef.current = null;
      console.log("🔌 [WebSocket] Socket desconectado (cleanup).");
    };
  }, [addRequest]);
}
