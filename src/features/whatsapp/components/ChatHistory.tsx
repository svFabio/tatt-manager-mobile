// src/features/whatsapp/components/ChatHistory.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { chatService } from '../../../services/chat.service'; // Asegúrate de apuntar a la ruta real de tu servicio
import { COLORS } from '../../../theme/colors'; // Usará tu paleta del sistema

interface Message {
  id?: number | string;
  contenido: string;
  direccion: 'inbound' | 'outbound' | 'cliente' | 'sistema';
  timestamp: string | number | Date;
}

export default function ChatHistory({ remoteJid }: { remoteJid: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Tu servicio ya aplica el encodeURIComponent internamente de manera segura
        const response = await chatService.getMensajes(remoteJid);
        
        // Manejo flexible de la respuesta según cómo responda tu controlador de NestJS/Express
        if (response && response.ok) {
          setMessages(response.data);
        } else {
          setMessages(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        console.error("Error obteniendo el historial real del backend:", error);
      } finally {
        setLoading(false);
      }
    };

    if (remoteJid) {
      loadMessages();
    }
  }, [remoteJid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary?.DEFAULT || "#25D366"} />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay mensajes en esta conversación.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={messages}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => {
        // Criterio 3: Identificar si el mensaje vino del cliente (inbound) o del bot/sistema (outbound)
        const isClient = item.direccion === 'inbound' || item.direccion === 'cliente';

        return (
          <View style={[styles.messageWrapper, isClient ? styles.clientAlign : styles.systemAlign]}>
            <View style={[styles.bubble, isClient ? styles.clientBubble : styles.systemBubble]}>
              <Text style={styles.messageText}>{item.contenido}</Text>
              <Text style={styles.timeText}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { padding: 14, paddingBottom: 30 },
  messageWrapper: { flexDirection: 'row', marginVertical: 4, width: '100%' },
  clientAlign: { justifyContent: 'flex-start' },
  systemAlign: { justifyContent: 'flex-end' },
  bubble: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 14, 
    maxWidth: Dimensions.get('window').width * 0.75,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  clientBubble: { 
    backgroundColor: '#1f2c34', // Fondo gris oscuro para mensajes del cliente en modo dark
    borderTopLeftRadius: 0,
  },
  systemBubble: { 
    backgroundColor: '#005c4b', // Verde WhatsApp oscuro clásico para respuestas del bot
    borderTopRightRadius: 0,
  },
  messageText: { fontSize: 15, color: '#e9edef' }, // Texto claro de alta legibilidad
  timeText: { fontSize: 10, color: '#8696a0', alignSelf: 'flex-end', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#8696a0', fontSize: 16, textAlign: 'center' }
});