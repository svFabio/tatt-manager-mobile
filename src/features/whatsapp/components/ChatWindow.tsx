import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../tipes';

interface ChatWindowProps {
  messages: Message[];
  nombre: string;
  loading: boolean;
  onEnviarMensaje: (texto: string) => Promise<void>;
}

export const ChatWindow = ({ messages, nombre, loading, onEnviarMensaje }: ChatWindowProps) => {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSend = async () => {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      await onEnviarMensaje(texto.trim());
      setTexto(''); // Limpieza inmediata tras éxito
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View className="flex-1 bg-[#050505]">
      {/* Header */}
      <View className="p-4 border-b border-gray-800 bg-[#0a0a0a]">
        <Text className="text-white font-bold text-xl">{nombre}</Text>
      </View>

      {/* Hilo de mensajes */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#a29bfe" />
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {messages.map((m) => {
            // 'out' es enviado por nosotros (derecha). 'in' es recibido del cliente (izquierda).
            const esMio = m.direccion === 'out';
            return (
              <View key={m.id} className={`mb-4 ${esMio ? 'items-end' : 'items-start'}`}>
                <View className={`p-4 rounded-2xl max-w-[80%] ${
                  esMio ? 'bg-[#a29bfe] rounded-tr-none' : 'bg-[#1e1e1e] rounded-tl-none border border-gray-800'
                }`}>
                  <Text className={`${esMio ? 'text-black' : 'text-white'} text-base`}>
                    {m.contenido}
                  </Text>
                </View>
                <Text className="text-gray-600 text-[10px] mt-1 italic">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Input de texto operativo */}
      <View className="p-4 bg-[#111] border-t border-gray-900 flex-row items-center gap-3">
        <TextInput 
          className="flex-1 bg-[#1a1a1a] text-white p-4 rounded-full px-6 border border-gray-800"
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#444"
          value={texto}
          onChangeText={setTexto}
          editable={!enviando}
        />
        <TouchableOpacity 
          onPress={handleSend}
          disabled={enviando || !texto.trim()}
          className="bg-[#a29bfe] w-14 h-14 rounded-full items-center justify-center opacity-90 active:scale-95"
        >
          {enviando ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Ionicons name="send" size={20} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};