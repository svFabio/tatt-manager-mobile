import { useState } from 'react';
import { Chat, Message } from '../tipes';

export const useWhatsAppChat = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    // Datos de prueba (MOCK) que coinciden con tu diseño oscuro
    setMessages([
      { 
        id: '1', 
        texto: 'Hola Arturo! ¿Tienes espacio para un tatuaje pequeño mañana?', 
        emisor: 'cliente', 
        tipo: 'texto', 
        fecha: new Date().toISOString() 
      },
      { 
        id: '2', 
        texto: '¡Hola! Sí, tengo un hueco a las 4 PM. ¿Qué diseño tienes en mente?', 
        emisor: 'bot', 
        tipo: 'texto', 
        fecha: new Date().toISOString() 
      },
    ]);
  };

  return {
    selectedChat,
    messages,
    handleSelectChat
  };
};