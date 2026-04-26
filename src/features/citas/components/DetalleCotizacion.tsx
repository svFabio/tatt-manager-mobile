import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const DetalleCotizacion = () => {
  const [tiempo, setTiempo] = useState('');
  const [costo, setCosto]   = useState('');

  return (
    <View className="bg-[#121212] rounded-2xl border border-white/5 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="request-quote" size={18} color="#7E51FF" />
        <Text className="text-white text-base font-bold ml-2">Cotización</Text>
      </View>

      <Text className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">
        Tiempo estimado de sesión
      </Text>
      <View className="flex-row items-center bg-[#1A1A1A] rounded-xl px-3 py-3 mb-4 border border-white/5">
        <MaterialIcons name="access-time" size={16} color="#6B7280" />
        <TextInput
          value={tiempo}
          onChangeText={setTiempo}
          placeholder="ej. 4 horas"
          placeholderTextColor="#4B5563"
          className="flex-1 text-white text-sm ml-2"
        />
      </View>

      <Text className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Costo total</Text>
      <View className="flex-row items-center bg-[#1A1A1A] rounded-xl px-3 py-3 mb-6 border border-white/5">
        <Text className="text-gray-400 text-sm font-bold mr-2">$</Text>
        <TextInput
          value={costo}
          onChangeText={setCosto}
          placeholder="0.00"
          placeholderTextColor="#4B5563"
          className="flex-1 text-white text-sm"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        className="bg-[#7E51FF] rounded-2xl py-4 flex-row items-center justify-center"
        onPress={() => console.log('Cotización:', { tiempo, costo })}
      >
        <Text className="text-white text-sm font-bold mr-2">Enviar Cotización</Text>
        <MaterialIcons name="send" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};
