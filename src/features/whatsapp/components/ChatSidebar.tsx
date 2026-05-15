import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
// Ruta corregida: sube un nivel para encontrar types.ts
import { Chat } from '../tipes'; 

interface Props {
  chats: Chat[];
  onSelect: (chat: Chat) => void;
  selectedId?: string;
}

export const ChatSidebar = ({ chats, onSelect, selectedId }: Props) => {
  return (
    <View className="w-80 border-r border-gray-800 bg-[#0a0a0a]">
      <View className="p-6 border-b border-gray-900">
        <Text className="text-white text-2xl font-bold">Chats</Text>
      </View>
      <ScrollView>
        {chats.map((chat) => (
          <TouchableOpacity 
            key={chat.id} 
            onPress={() => onSelect(chat)}
            className={`p-4 border-b border-gray-900 ${selectedId === chat.id ? 'bg-[#1a1a1a]' : ''}`}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-bold text-lg">{chat.nombreCliente}</Text>
              <Text className="text-gray-500 text-[10px]">{chat.fechaUltimo}</Text>
            </View>
            <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
              {chat.ultimoMensaje}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};