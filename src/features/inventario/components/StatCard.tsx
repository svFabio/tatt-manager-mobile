import React from 'react';
import { Text } from "@/src/components/StyledText";
import { View } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '../../../theme/colors';

interface Props {
    label: string;
    value: number;
    variant?: 'default' | 'bajo';
}

export function StatCard({ label, value, variant = 'default' }: Props) {
    const isBajo = variant === 'bajo';
    
    const icon = isBajo ? 'warning' : 'inventory-2';
    const iconColor = isBajo ? COLORS.danger.badge : COLORS.primary.DEFAULT;

    return (
        <View
            className={`rounded-2xl p-4 mb-3 flex-row items-center min-h-[72px] border ${isBajo ? 'bg-danger-bg border-danger-ghost' : 'bg-dark-100 border-primary-border'}`}
        >
            <View
                className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isBajo ? 'bg-danger-ghost' : 'bg-primary-ghost'}`}
            >
                <MaterialIcons name={icon as any} size={20} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text
                    className={`text-[10px] font-bold tracking-widest ${isBajo ? 'text-danger-badge' : 'text-text-muted'}`}
                    numberOfLines={1}
                >
                    {label}
                </Text>
                <Text
                    className={`text-xl font-bold mt-0.5 ${isBajo ? 'text-danger-badge' : 'text-text-primary'}`}
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}
