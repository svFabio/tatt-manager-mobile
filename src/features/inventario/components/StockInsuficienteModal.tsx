import { Modal, View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../../theme/colors';

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
                <View className="bg-dark-100 w-full rounded-3xl p-6 border border-white/5">

                    {/* Icono */}
                    <View className="items-center mb-5">
                        <View
                            className="w-16 h-16 rounded-full items-center justify-center"
                            style={{
                                backgroundColor: COLORS.danger.bg,
                                borderWidth: 1,
                                borderColor: COLORS.danger.border,
                            }}
                        >
                            <MaterialIcons name="remove-shopping-cart" size={30} color={COLORS.danger.text} />
                        </View>
                    </View>

                    {/* Título */}
                    <Text className="text-white text-xl font-bold text-center mb-2">
                        Stock insuficiente
                    </Text>

                    {/* Descripción */}
                    <Text className="text-sm text-center mb-6 leading-5" style={{ color: COLORS.text.secondary }}>
                        No puedes reducir más el stock de{' '}
                        <Text className="text-white font-semibold">{nombre}</Text>.
                    </Text>

                    {/* Stock actual */}
                    <View className="bg-dark-100 rounded-2xl px-4 py-3 flex-row items-center justify-between mb-6 border border-white/5">
                        <Text className="text-xs uppercase tracking-widest" style={{ color: COLORS.text.muted }}>Stock actual</Text>
                        <Text className="font-bold text-base" style={{ color: COLORS.danger.text }}>
                            {cantidad}{' '}
                            <Text className="text-sm font-normal" style={{ color: COLORS.text.muted }}>{unidad}</Text>
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
