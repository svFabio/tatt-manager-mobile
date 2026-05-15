import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../tipes'; 

export const ChatWindow = ({ messages, nombre }: { messages: Message[], nombre: string }) => {
  return (
    <View className="flex-1 bg-[#050505]">
      {/* Header */}
      <View className="p-4 border-b border-gray-800 bg-[#0a0a0a]">
        <Text className="text-white font-bold text-xl">{nombre}</Text>
      </View>

      {/* Hilo de mensajes */}
      <ScrollView className="flex-1 p-4">
        {messages.map((m) => (
          <View key={m.id} className={`mb-4 ${m.emisor === 'bot' ? 'items-end' : 'items-start'}`}>
            <View className={`p-4 rounded-2xl max-w-[80%] ${m.emisor === 'bot' ? 'bg-[#2a2a2a] rounded-tr-none' : 'bg-[#1e1e1e] rounded-tl-none border border-gray-800'}`}>
              <Text className="text-white text-base">{m.texto}</Text>
            </View>
            <Text className="text-gray-600 text-[10px] mt-1 italic">
              {new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input de texto */}
      <View className="p-4 bg-[#111] border-t border-gray-900 flex-row items-center gap-3">
        <TextInput 
          className="flex-1 bg-[#1a1a1a] text-white p-4 rounded-full px-6 border border-gray-800"
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#444"
        />
        <TouchableOpacity className="bg-[#a29bfe] w-14 h-14 rounded-full items-center justify-center">
          <Ionicons name="send" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};