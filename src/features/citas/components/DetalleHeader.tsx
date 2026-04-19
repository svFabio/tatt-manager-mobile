import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

export const DetalleHeader = () => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-3 py-2 -mt-6 mb-2">

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="p-1"
        >
          <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="text-white text-base font-bold">
          Detaller de solicitud
        </Text>
      </View>

      <View className="bg-[#7E51FF]/20 border border-[#7E51FF]/40 px-3 py-1 rounded-full">
        <Text className="text-[#7E51FF] text-[10px] font-bold tracking-widest uppercase">
          Cotización
        </Text>
      </View>

    </View>
  );
};