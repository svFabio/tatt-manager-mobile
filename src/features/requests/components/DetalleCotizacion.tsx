import { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, TextInput } from '@/src/components/StyledText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CitasAPI } from '../../../api/citas';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../theme/colors';

export const DetalleCotizacion = ({ solicitudId, estado }: { solicitudId: number, estado?: string }) => {
  const router = useRouter();
  const [tiempo, setTiempo] = useState('');
  const [costo, setCosto]   = useState('');
  const [loading, setLoading] = useState(false);

  const isCotizada = estado !== 'PENDIENTE';

  const enviarCotizacion = async () => {
    try {
      setLoading(true);
      await CitasAPI.cotizarSolicitud(solicitudId, Number(costo), Number(tiempo));
      Alert.alert('Éxito', 'Cotización enviada al cliente por WhatsApp.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: unknown) {
      console.error('[Cotizar]', error);
      Alert.alert('Error', 'Hubo un problema al enviar la cotización.');
    } finally {
      setLoading(false);
    }
  };

  const handleCotizar = () => {
    if (!tiempo || !costo) {
      Alert.alert('Error', 'Por favor ingresa el tiempo estimado y el costo.');
      return;
    }
    
    Alert.alert(
      'Confirmar Cotización',
      '¿Estás seguro de enviar esta cotización? Una vez enviada no podrás modificarla.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, enviar', onPress: enviarCotizacion }
      ]
    );
  };

  return (
    <View className="bg-dark rounded-2xl border border-white/5 p-4">
      <View className="flex-row items-center mb-4">
        <MaterialIcons name="request-quote" size={18} color={COLORS.primary.DEFAULT} />
        <Text className="text-white text-base font-bold ml-2">Cotización</Text>
      </View>

      <Text className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.text.muted }}>
        Tiempo estimado de sesión
      </Text>
      <View className="flex-row items-center bg-dark-100 rounded-xl px-3 py-3 mb-4 border border-white/5">
        <MaterialIcons name="access-time" size={16} color={COLORS.text.muted} />
        <TextInput
          value={tiempo}
          onChangeText={setTiempo}
          placeholder="ej. 4"
          placeholderTextColor={COLORS.text.dimmed}
          className="flex-1 text-white text-sm ml-2"
          keyboardType="numeric"
          editable={!isCotizada}
        />
      </View>

      <Text className="text-[10px] uppercase tracking-widest mb-2" style={{ color: COLORS.text.muted }}>Costo total</Text>
      <View className="flex-row items-center bg-dark-100 rounded-xl px-3 py-3 mb-6 border border-white/5">
        <Text className="text-sm font-bold mr-2" style={{ color: COLORS.text.secondary }}>$</Text>
        <TextInput
          value={costo}
          onChangeText={setCosto}
          placeholder="0.00"
          placeholderTextColor={COLORS.text.dimmed}
          className="flex-1 text-white text-sm"
          keyboardType="numeric"
          editable={!isCotizada}
        />
      </View>

      {isCotizada ? (
        <View className="bg-dark-200 rounded-2xl py-4 flex-row items-center justify-center">
          <Text className="text-sm font-bold mr-2" style={{ color: COLORS.text.secondary }}>Cotización ya enviada</Text>
          <MaterialIcons name="check-circle" size={16} color={COLORS.success.DEFAULT} />
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-primary rounded-2xl py-4 flex-row items-center justify-center"
          onPress={handleCotizar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white text-sm font-bold mr-2">Enviar Cotización</Text>
              <MaterialIcons name="send" size={16} color={COLORS.text.primary} />
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
