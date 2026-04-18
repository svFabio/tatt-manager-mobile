import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EndSessionScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#121212] justify-center items-center px-6">
      <View className="bg-[#1E1E1E] p-6 rounded-2xl w-full items-center border border-gray-800">
        <View className="w-16 h-16 bg-[#2A2A2A] rounded-full items-center justify-center mb-4">
          <Feather name="log-out" size={32} color="#FF3B30" />
        </View>
        <Text className="text-white text-xl font-bold mb-2 text-center">Terminar Sesión</Text>
        <Text className="text-gray-400 text-center mb-8">
            aqui va el formulario de cierre de sesion de tatuaje
        </Text>
        
        <TouchableOpacity 
          className="bg-[#7E51FF] w-full py-4 rounded-xl flex-row justify-center items-center"
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-center text-lg">Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
