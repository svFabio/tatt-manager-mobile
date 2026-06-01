import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/theme/colors';
import api from '@/src/api/axios';

// Interfaces basadas en la base de datos
interface Conversacion {
  remoteJid: string;
  ultimoMensaje: string;
  totalMensajes: number;
  ultimoContenido: string | null;
  ultimaDireccion: string | null;
  clienteNombre: string | null;
  telefonoReal: string;
}

interface Mensaje {
  id: string;
  remoteJid: string;
  direccion: 'ENTRANTE' | 'SALIENTE';
  timestamp: string;
  contenido: string;
  tipo: string;
}

export default function ChatScreen() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedChat, setSelectedChat] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchConversaciones();
  }, []);

  const fetchConversaciones = async () => {
    try {
      setLoadingList(true);
      const res = await api.get('/chat/conversaciones');
      const arr = res.data?.data || res.data;
      setConversaciones(Array.isArray(arr) ? arr : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchMensajes = async (jid: string) => {
    try {
      setLoadingChat(true);
      const res = await api.get(`/chat/mensajes/${jid}`);
      const arr = res.data?.data || res.data;
      setMensajes(Array.isArray(arr) ? arr : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSelectChat = (chat: Conversacion) => {
    setSelectedChat(chat);
    fetchMensajes(chat.remoteJid);
  };

  const handleBack = () => {
    setSelectedChat(null);
    setMensajes([]);
    fetchConversaciones();
  };

  const handleDeleteChat = (jid: string) => {
    Alert.alert(
      'Eliminar Chat',
      '¿Estás seguro de que deseas eliminar todo el historial de este chat?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/chat/conversacion/${jid}`);
              fetchConversaciones();
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Error', 'No se pudo eliminar el chat');
            }
          }
        }
      ]
    );
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;
    try {
      setSending(true);
      const textToSend = inputText.trim();
      setInputText('');
      
      // Update local para percepción de velocidad
      const tempMsg: Mensaje = {
        id: Math.random().toString(),
        remoteJid: selectedChat.remoteJid,
        direccion: 'SALIENTE',
        timestamp: new Date().toISOString(),
        contenido: textToSend,
        tipo: 'text'
      };
      setMensajes(prev => [...prev, tempMsg]);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Enviarlo al servidor y a WhatsApp
      await api.post(`/chat/enviar/${selectedChat.remoteJid}`, { texto: textToSend });
      
      // Refrescar para tener el timestamp real y ID real
      await fetchMensajes(selectedChat.remoteJid);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje, verifica la conexión con WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversaciones.filter(c => {
    const term = searchQuery.toLowerCase();
    const name = c.clienteNombre?.toLowerCase() || '';
    const phone = c.telefonoReal?.toLowerCase() || '';
    return name.includes(term) || phone.includes(term);
  });

  const getChatName = (c: Conversacion) => c.clienteNombre || c.telefonoReal || c.remoteJid;

  // --- RENDER CHAT DETAIL ---
  if (selectedChat) {
    return (
      <View className="flex-1 bg-dark">
        {/* Header del Chat */}
        <View className="flex-row items-center px-4 py-4 border-b border-dark-200 bg-dark">
          <TouchableOpacity onPress={handleBack} className="mr-3 p-2">
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-full bg-dark-100 items-center justify-center mr-3">
            <Ionicons name="person" size={20} color={COLORS.text.muted} />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-bold text-lg">{getChatName(selectedChat)}</Text>
            <Text className="text-text-muted text-xs">Chat de Estudio</Text>
          </View>
        </View>

        {/* Mensajes */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          className="flex-1"
        >
          {loadingChat ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator color={COLORS.primary.DEFAULT} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={mensajes}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => {
                const isOut = item.direccion === 'SALIENTE';
                return (
                  <View className={`mb-3 max-w-[80%] rounded-2xl px-4 py-3 ${isOut ? 'self-end bg-primary' : 'self-start bg-dark-100 border border-dark-200'}`}>
                    <Text className={`text-sm ${isOut ? 'text-white font-medium' : 'text-text-primary'}`}>
                      {item.contenido}
                    </Text>
                    <Text className={`text-[10px] mt-1 text-right ${isOut ? 'text-white opacity-70' : 'text-text-muted'}`}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View className="items-center mt-10">
                  <Text className="text-text-muted">No hay mensajes en esta conversación.</Text>
                </View>
              }
            />
          )}

          {/* Barra de Input */}
          <View className="flex-row items-center px-4 py-3 bg-dark border-t border-dark-200">
            <View className="flex-1 bg-dark-100 rounded-full px-4 py-2 flex-row items-center border border-dark-200">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Escribe un mensaje..."
                placeholderTextColor={COLORS.text.muted}
                className="flex-1 text-text-primary h-full max-h-24 min-h-[40px]"
                multiline
              />
            </View>
            <TouchableOpacity 
              onPress={handleSend}
              disabled={sending || !inputText.trim()}
              className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${inputText.trim() ? 'bg-primary' : 'bg-dark-100'}`}
            >
              {sending ? (
                <ActivityIndicator color={COLORS.dark.DEFAULT} size="small" />
              ) : (
                <Ionicons name="send" size={20} color={inputText.trim() ? COLORS.dark.DEFAULT : COLORS.text.muted} style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // --- RENDER CONVERSATION LIST ---
  return (
    <View className="flex-1 bg-dark">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-text-primary text-3xl font-black tracking-tight mb-4">Chat</Text>
        
        {/* Search */}
        <View className="bg-dark-100 rounded-2xl flex-row items-center px-4 py-3 border border-dark-200">
          <Ionicons name="search" size={20} color={COLORS.text.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre o número..."
            placeholderTextColor={COLORS.text.muted}
            className="flex-1 text-text-primary ml-3 h-[24px] p-0"
          />
        </View>
      </View>

      {loadingList ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color={COLORS.primary.DEFAULT} />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.remoteJid}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => handleSelectChat(item)}
              className="bg-dark-100 rounded-3xl p-4 mb-3 border border-dark-200 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-full bg-dark-200 items-center justify-center">
                <Ionicons name="person" size={20} color={COLORS.text.secondary} />
              </View>
              
              <View className="flex-1 ml-4 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-text-primary font-bold text-base" numberOfLines={1}>
                    {getChatName(item)}
                  </Text>
                  <Text className="text-text-muted text-[10px]">
                    {item.ultimoMensaje ? new Date(item.ultimoMensaje).toLocaleDateString() : ''}
                  </Text>
                </View>
                <Text className="text-text-secondary text-xs" numberOfLines={1}>
                  {item.ultimoContenido || 'Mensaje multimedia'}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => handleDeleteChat(item.remoteJid)}
                className="ml-3 p-2 bg-dark-200 rounded-full w-10 h-10 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger.text} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-text-muted">No se encontraron conversaciones.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
