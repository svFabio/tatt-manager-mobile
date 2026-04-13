import { useState, useCallback } from "react";

/**
 * Hook para manejar el estado de conexión del bot de WhatsApp.
 */
export function useWhatsApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const updateConnectionStatus = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (connected) {
      setLastSync(new Date().toLocaleTimeString("es-ES"));
    }
  }, []);

  return {
    isConnected,
    lastSync,
    updateConnectionStatus,
  };
}
