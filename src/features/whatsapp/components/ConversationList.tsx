// src/features/whatsapp/components/ConversationList.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { chatService } from '../../../services/chat.service'; // Asegúrate de que apunte bien a tus carpetas

// 1. Definimos una interfaz limpia para tipar la conversación y evitar el error 'never'
interface Conversacion {
  id?: number | string;
  remoteJid: string;
  nombre: string;
  ultimoMensaje?: string;
  timestamp: string | number | Date;
}

export default function ConversationList() {
  const router = useRouter();
  
  // 2. Le indicamos a useState que manejará un arreglo de nuestro tipo Conversacion[]
  const [conversations, setConversations] = useState<Conversacion[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatService.getConversaciones();
        setConversations(response.ok ? response.data : (Array.isArray(response) ? response : []));
      } catch (error) {
        console.error("Error cargando lista de conversaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  // TypeScript ahora sabe perfectamente que 'chat' tiene la propiedad 'nombre'
  const filtered = conversations.filter((chat) =>
    chat.nombre && chat.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#25D366" />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar cliente por nombre..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#888"
      />
      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>No se encontraron chats de WhatsApp.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              // 3. Corregimos el redireccionamiento para que apunte a la ruta estática /chat sin colisiones
              onPress={() => router.push({
                pathname: `/chat/${item.remoteJid}` as any, // <-- Le añadimos 'as any' aquí
                params: { nombre: item.nombre }
            })}
            >
              <View style={styles.row}>
                <Text style={styles.name}>{item.nombre}</Text>
                <Text style={styles.time}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {item.ultimoMensaje || "Sin mensajes"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  searchBar: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd', color: '#000' },
  chatItem: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  time: { color: '#999', fontSize: 12 },
  preview: { color: '#666', fontSize: 14, marginTop: 4 },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 20, fontSize: 15 }
});