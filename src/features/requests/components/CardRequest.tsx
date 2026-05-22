import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/StyledText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Badge } from './Badge';
import type { EstadoCita } from '../../../types/citas';
import { COLORS } from '../../../theme/colors';

interface CardRequestProps {
    name: string;
    artist: string;
    status: EstadoCita;
    recibido: string;
    onPress: () => void;
}

export const CardRequest = ({ name, artist, status, recibido, onPress }: CardRequestProps) => (
    <View className="bg-dark mb-4 p-5 rounded-[28px] border border-white/5">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-3">
                <Text className="text-white text-lg font-bold mb-2 tracking-tight">{name}</Text>
                <Badge variant={status} />
            </View>
            <View className="items-end">
                <Text className="text-[10px] uppercase font-bold tracking-widest mb-1" style={{ color: COLORS.text.muted }}>Recibido</Text>
                <Text className="text-xs font-medium" style={{ color: COLORS.text.secondary }}>{recibido}</Text>
            </View>
        </View>

        {/* Artist row */}
        <View className="flex-row items-center mb-4">
            <MaterialIcons name="person-outline" size={14} color={COLORS.text.muted} />
            <Text className="text-xs ml-1" style={{ color: COLORS.text.muted }}>{artist}</Text>
        </View>

        {/* Footer action */}
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center justify-end pt-3 border-t border-white/5"
        >
            <Text className="text-[11px] font-bold uppercase tracking-widest mr-1" style={{ color: COLORS.text.secondary }}>Ver Detalles</Text>
            <MaterialIcons name="chevron-right" size={16} color={COLORS.text.secondary} />
        </TouchableOpacity>
    </View>
);
