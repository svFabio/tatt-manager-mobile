import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';
import { useWhatsAppChat } from '../hooks/useWhatsAppChat';
import { chatService } from '../../../services/chatService'; // Asegura la ruta correcta a tu servicio
import { Chat } from '../tipes'; // Corregido el typo de "tipes" a "types" si aplica

export const WhatsAppScreen = () => {
  const { selectedChat, messages, handleSelectChat } = useWhatsAppChat();
  
  // 1. Estado para almacenar los chats reales de la base de datos
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Efecto de integración para conectarse al backend al abrir la pantalla
  useEffect(() => {
    const cargarConversaciones = async () => {
      try {
        const datosBack = await chatService.getConversaciones();
        setChats(datosBack); // Guardamos la respuesta del backend (el array [])
      } catch (error) {
        console.error("Error al conectar con el backend de chat:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarConversaciones();
  }, []);

  // 3. Mientras carga, muestra un spinner limpio en la app móvil
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#25D366" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando chats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row">
      {/* 4. Pasamos los chats del backend al Sidebar en lugar del MOCK_CHATS */}
      <ChatSidebar 
        chats={chats} 
        onSelect={handleSelectChat}
        selectedId={selectedChat?.id}
      />
      
      {selectedChat ? (
        <ChatWindow 
  nombre={selectedChat?.nombreCliente || selectedChat?.telefono || 'Sin Nombre'} 
  messages={messages} 
/>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888' }}>Selecciona un chat para empezar</Text>
        </View>
      )}
    </View>
  );
};