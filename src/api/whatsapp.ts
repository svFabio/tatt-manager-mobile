import api from "./axios";

export const WhatsAppAPI = {
  /** Obtiene el estado actual del bot conectado al negocio */
  getStatus: async () => {
    const { data } = await api.get("/status-whatsapp");
    return data as { conectado: boolean; qr: string | null; activo: boolean; botsActivos: number };
  },

  /** Dispara el comienzo del bot, y preparará el entorno para recibir el QR vía Socket */
  startWhatsApp: async () => {
    const { data } = await api.post("/start-whatsapp");
    return data;
  },

  /** Cierra sesión y desconecta el bot actual */
  logoutWhatsApp: async () => {
    const { data } = await api.post("/logout");
    return data;
  },

  /** Reinicia el contenedor de WhatsApp */
  restartWhatsApp: async () => {
    const { data } = await api.post("/restart-whatsapp");
    return data;
  },

  /** Solicita el código numérico de 8 dígitos para emparejamiento desde la app nativa de WhatsApp */
  requestPairingCode: async (telefono: string) => {
    const { data } = await api.post("/pairing-code", { telefono });
    return data as { codigo?: string; error?: string };
  },
};
