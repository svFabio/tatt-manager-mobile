import { useState, useCallback } from 'react';
import { Chat, Message } from '../tipes'; // Asegúrate de apuntar a tus types correctos
import { chatService } from '../../../services/chatService';

export const useWhatsAppChat = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);

  const handleSelectChat = useCallback(async (chat: Chat) => {
    setSelectedChat(chat);
    setLoadingMensajes(true);
    try {
      // Consumimos el historial real del backend usando el control de JID codificado
      const res = await chatService.getMensajes(chat.remoteJid);
      setMessages(res.data || res);
    } catch (error) {
      console.error("Error al obtener mensajes del chat:", error);
    } finally {
      setLoadingMensajes(false);
    }
  }, []);

  const agregarNuevoMensajeLocal = useCallback((nuevoMsg: Message) => {
    setMessages((prev) => [...prev, nuevoMsg]);
  }, []);

  return {
    selectedChat,
    messages,
    loadingMensajes,
    handleSelectChat,
    setMessages,
    agregarNuevoMensajeLocal
  };
};