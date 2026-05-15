export interface Message {
  id: string;
  texto: string;
  tipo: 'texto' | 'imagen';
  archivoUrl?: string;
  emisor: 'cliente' | 'bot';
  fecha: string;
}

export interface Chat {
  id: string;
  nombreCliente: string;
  telefono: string;
  ultimoMensaje: string;
  fechaUltimo: string;
  clienteId?: number;
}