import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Badge } from './Badge';
import type { EstadoCita } from '../../../types/citas';

interface CardRequestProps {
    name: string;
    artist: string;
    status: EstadoCita;
    recibido: string;
    onPress: () => void;
}

export const CardRequest = ({ name, artist, status, recibido, onPress }: CardRequestProps) => (
    <View className="bg-[#121212] mb-4 p-5 rounded-[28px] border border-white/5">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-3">
                <Text className="text-white text-lg font-bold mb-2 tracking-tight">{name}</Text>
                <Badge variant={status} />
            </View>
            <View className="items-end">
                <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Recibido</Text>
                <Text className="text-gray-300 text-xs font-medium">{recibido}</Text>
            </View>
        </View>

        {/* Artist row */}
        <View className="flex-row items-center mb-4">
            <MaterialIcons name="person-outline" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-1">{artist}</Text>
        </View>

        {/* Footer action */}
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center justify-end pt-3 border-t border-white/5"
        >
            <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mr-1">Ver Detalles</Text>
            <MaterialIcons name="chevron-right" size={16} color="#9CA3AF" />
        </TouchableOpacity>
    </View>
);
