import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { CitaDetails } from '../../../types/citas';

const formatDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

const DetailRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <View className="flex-row justify-between items-center">
    <Text className="text-gray-500 text-xs uppercase tracking-widest">{label}</Text>
    <Text className={`text-sm font-semibold ${highlight ? 'text-[#7E51FF]' : 'text-white'}`}>
      {value || '—'}
    </Text>
  </View>
);

interface Props {
  detalle: CitaDetails;
}

export const DetalleCliente = ({ detalle }: Props) => (
  <>
    <View className="flex-row items-center mt-3 mb-1">
      <View className="w-8 h-8 rounded-full bg-[#7E51FF]/30 items-center justify-center mr-3">
        <MaterialIcons name="person" size={16} color="#7E51FF" />
      </View>
      <Text className="text-white text-base font-semibold">{detalle.clienteNombre}</Text>
    </View>

    <View className="flex-row items-center mt-2 mb-5">
      <MaterialIcons name="calendar-today" size={14} color="#6B7280" />
      <Text className="text-gray-500 text-xs ml-2">Recibido {formatDate(detalle.recibido)}</Text>
    </View>

    <View className="bg-[#121212] rounded-2xl border border-white/5 p-4 mb-5 gap-4">
      <DetailRow label="Zona"          value={detalle.zona}   highlight />
      <DetailRow label="Tamaño / Área" value={detalle.tamano} highlight />
    </View>
  </>
);
