import { Modal, View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Props {
    visible: boolean;
    nombre: string;
    cantidad: number;
    unidad: string;
    onClose: () => void;
}

export function StockInsuficienteModal({ visible, nombre, cantidad, unidad, onClose }: Props) {
    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 items-center justify-center px-6">
                <View className="bg-[#161616] w-full rounded-3xl p-6 border border-white/5">

                    {/* Icono */}
                    <View className="items-center mb-5">
                        <View className="w-16 h-16 rounded-full bg-red-900/30 border border-red-800/40 items-center justify-center">
                            <MaterialIcons name="remove-shopping-cart" size={30} color="#F87171" />
                        </View>
                    </View>

                    {/* Título */}
                    <Text className="text-white text-xl font-bold text-center mb-2">
                        Stock insuficiente
                    </Text>

                    {/* Descripción */}
                    <Text className="text-gray-400 text-sm text-center mb-6 leading-5">
                        No puedes reducir más el stock de{' '}
                        <Text className="text-white font-semibold">{nombre}</Text>.
                    </Text>

                    {/* Stock actual */}
                    <View className="bg-dark-100 rounded-2xl px-4 py-3 flex-row items-center justify-between mb-6 border border-white/5">
                        <Text className="text-gray-500 text-xs uppercase tracking-widest">Stock actual</Text>
                        <Text className="text-red-400 font-bold text-base">
                            {cantidad}{' '}
                            <Text className="text-gray-500 text-sm font-normal">{unidad}</Text>
                        </Text>
                    </View>

                    {/* Botón */}
                    <TouchableOpacity
                        onPress={onClose}
                        activeOpacity={0.8}
                        className="bg-primary rounded-2xl py-4 items-center"
                    >
                        <Text className="text-white font-bold text-sm">Entendido</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
