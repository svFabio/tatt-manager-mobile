export interface Chat {
  remoteJid: string;      // ID de WhatsApp (ej: "123456@s.whatsapp.net")
  ultimoMensaje: string;   // Fecha ISO
  totalMensajes: number;
  ultimoContenido: string | null;
  ultimaDireccion: string | null;
  clienteNombre: string | null;
  telefonoReal: string;
}

export interface Message {
  id: number | string;
  contenido: string;
  direccion: 'in' | 'out'; // 'in' = Cliente, 'out' = Negocio/Administrador
  timestamp: string;
}