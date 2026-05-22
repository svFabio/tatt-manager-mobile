import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';
import { useWhatsAppChat } from '../hooks/useWhatsAppChat';
import { chatService } from '../../../services/chatService'; 
import { Chat } from '../tipes';
// Importa aquí tu instancia global de socket si manejas una en la app:
// import { socket } from '../../../config/socket'; 

export const WhatsAppScreen = () => {
  const { 
    selectedChat, 
    messages, 
    loadingMensajes, 
    handleSelectChat, 
    agregarNuevoMensajeLocal,
  } = useWhatsAppChat();
  
  const [conversaciones, setConversaciones] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial de hilos del backend
  useEffect(() => {
    const cargarConversaciones = async () => {
      try {
        const datosBack = await chatService.getConversaciones();
        setConversaciones(datosBack.data || datosBack);
      } catch (error) {
        console.error("Error al conectar con el backend de chat:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarConversaciones();
  }, []);

  // Lógica operativa para empujar un nuevo mensaje manual al backend
  const handleEnviarMensajeBackend = async (textoMensaje: string) => {
    if (!selectedChat) return;
    try {
      const res = await chatService.enviarMensaje(selectedChat.remoteJid, textoMensaje);
      
      // Si el controlador nos devuelve la entidad creada, la anexamos
      if (res && res.data) {
        agregarNuevoMensajeLocal(res.data);
      } else {
        // Fallback por si la respuesta fuera simple exitosa
        agregarNuevoMensajeLocal({
          id: Date.now().toString(),
          contenido: textoMensaje,
          direccion: 'out',
          timestamp: new Date().toISOString()
        });
      }

      // Actualizamos visualmente la lista de chats para mover este al inicio
      setConversaciones((prev) => 
        prev.map(c => c.remoteJid === selectedChat.remoteJid 
          ? { ...c, ultimoContenido: textoMensaje, ultimoMensaje: new Date().toISOString() } 
          : c
        ).sort((a,b) => new Date(b.ultimoMensaje).getTime() - new Date(a.ultimoMensaje).getTime())
      );

    } catch (err) {
      console.error("Error enviando mensaje desde la pantalla:", err);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' }}>
        <ActivityIndicator size="large" color="#a29bfe" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando conversaciones reales...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row">
      <ChatSidebar 
        chats={conversaciones} 
        onSelect={handleSelectChat}
        selectedId={selectedChat?.remoteJid}
      />
      
      {selectedChat ? (
        <ChatWindow 
          nombre={selectedChat.clienteNombre || selectedChat.telefonoReal || 'Cliente'} 
          messages={messages}
          loading={loadingMensajes}
          onEnviarMensaje={handleEnviarMensajeBackend}
        />
      ) : (
        <View className="flex-1 bg-[#050505] justify-center items-center">
          <Text className="text-gray-500 text-base">Selecciona un chat para empezar a gestionar</Text>
        </View>
      )}
    </View>
  );
};