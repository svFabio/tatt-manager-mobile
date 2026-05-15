import React from 'react';
import { View, Text } from 'react-native';

interface Props {
    label: string;
    value: number;
    variant?: 'default' | 'bajo';
}

export function StatCard({ label, value, variant = 'default' }: Props) {
    const isBajo = variant === 'bajo';
    return (
        <View
            className="rounded-xl p-4 mb-3"
            style={{ backgroundColor: isBajo ? '#3B0A1F' : '#1A1A1A' }}
        >
            <Text
                className="text-xs font-semibold tracking-widest mb-1"
                style={{ color: isBajo ? '#F472B6' : '#6B7280' }}
            >
                {label}
            </Text>
            <Text
                className="text-2xl font-bold"
                style={{ color: isBajo ? '#F472B6' : '#FFFFFF' }}
            >
                {value}
            </Text>
        </View>
    );
}
