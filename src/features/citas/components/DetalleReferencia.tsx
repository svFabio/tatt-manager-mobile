import { View, Text, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Props {
  uri: string | null;
}

export const DetalleReferencia = ({ uri }: Props) => (
  <>
    <Text className="text-white text-lg font-bold mb-3">Referencia</Text>
    {uri ? (
      <Image source={{ uri }} className="w-full h-52 rounded-2xl mb-5" resizeMode="cover" />
    ) : (
      <View className="w-full h-52 rounded-2xl bg-[#1A1A1A] items-center justify-center mb-5">
        <MaterialIcons name="image-not-supported" size={40} color="#374151" />
        <Text className="text-gray-600 text-xs mt-2">Sin referencia</Text>
      </View>
    )}
  </>
);
