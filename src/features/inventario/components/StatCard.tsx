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
            className="rounded-2xl p-4 mb-3 flex-row items-center"
            style={{
                backgroundColor: isBajo ? COLORS.danger.bg : COLORS.dark[100],
                borderWidth: 1,
                borderColor: isBajo ? COLORS.danger.ghost : COLORS.primary.border,
            }}
        >
            <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{
                    backgroundColor: isBajo ? COLORS.danger.ghost : COLORS.primary.ghost,
                }}
            >
                <MaterialIcons name={icon as any} size={20} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text
                    className="text-[10px] font-bold tracking-widest"
                    style={{ color: isBajo ? COLORS.danger.badge : COLORS.text.muted }}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.7}
                >
                    {label}
                </Text>
                <Text
                    className="text-xl font-bold mt-0.5"
                    style={{ color: isBajo ? COLORS.danger.badge : COLORS.text.primary }}
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}
