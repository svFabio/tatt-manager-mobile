import { View, Text, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../../theme/colors';

interface Props {
  uri: string | null;
}

export const DetalleReferencia = ({ uri }: Props) => (
  <>
    <Text className="text-white text-lg font-bold mb-3">Referencia</Text>
    {uri ? (
      <Image source={{ uri }} className="w-full h-52 rounded-2xl mb-5" resizeMode="cover" />
    ) : (
      <View className="w-full h-52 rounded-2xl bg-dark-100 items-center justify-center mb-5">
        <MaterialIcons name="image-not-supported" size={40} color={COLORS.text.dimmed} />
        <Text className="text-text-muted text-xs mt-2">Sin referencia</Text>
      </View>
    )}
  </>
);
