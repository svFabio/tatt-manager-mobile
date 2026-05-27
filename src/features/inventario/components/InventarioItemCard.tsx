import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { Text, TextInput } from '@/src/components/StyledText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { InventarioAPI } from '../../../api/inventario';
import type { InventarioItem } from '../../../types/inventario';
import { StockInsuficienteModal } from './StockInsuficienteModal';
import { COLORS } from '../../../theme/colors';

import { useRouter } from 'expo-router';

interface Props {
    item: InventarioItem;
    onUpdated: (updated: InventarioItem) => void;
    index?: number;
}

export function InventarioItemCard({ item, onUpdated, index = 0 }: Props) {
    const router = useRouter();
    const [inputValue, setInputValue] = useState(item.cantidadActual.toString());
    const [loading, setLoading]       = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                delay: index * 60,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 350,
                delay: index * 60,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        setInputValue(item.cantidadActual.toString());
    }, [item.cantidadActual]);

    const applyDelta = async (delta: number) => {
        if (loading) return;
        if (item.cantidadActual + delta < 0) {
            setModalVisible(true);
            return;
        }
        setLoading(true);
        try {
            const res = await InventarioAPI.ajusteRapido({ tipo: item.tipo, refId: item.refId, delta });
            if (res.ok) {
                setInputValue(res.data.cantidadActual.toString());
                onUpdated(res.data);
            } else {
                Alert.alert('Error', (res as any).error ?? 'No se pudo ajustar el stock');
            }
        } catch (error: unknown) {
            const e = error as Record<string, any>;
            const msg = e?.response?.data?.error ?? 'Error al ajustar el stock';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        const newVal = parseInt(inputValue, 10);
        if (isNaN(newVal) || newVal < 0) {
            Alert.alert('Valor inválido', 'Ingresa un número mayor o igual a 0.');
            return;
        }
        const delta = newVal - item.cantidadActual;
        if (delta === 0) return;
        applyDelta(delta);
    };

    const dotColor = item.colorHex ?? COLORS.text.muted;

    const getCatIcon = () => {
        if (item.tipo === 'tinta') return 'water-opacity'; // Gota de tinta
        if (item.tipo === 'aguja' || item.nombre.toLowerCase().includes('aguja')) return 'needle'; // Aguja
        if (item.nombre.toLowerCase().includes('cap') || item.tipo === 'cap' as any) return 'cup'; // Cap
        return 'archive-outline'; // Default
    };

    return (
        <>
        <StockInsuficienteModal
            visible={modalVisible}
            nombre={item.nombre}
            cantidad={item.cantidadActual}
            unidad={item.unidad}
            onClose={() => setModalVisible(false)}
        />
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
        >
        <View
            className="rounded-2xl p-4 mb-3"
            style={{
                backgroundColor: COLORS.dark[100],
                borderWidth: 1,
                borderColor: item.esBajo ? COLORS.danger.border : COLORS.border.subtle,
            }}
        >
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center flex-1 mr-2">
                    <View
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                        style={{ 
                            backgroundColor: dotColor === '#000000' || dotColor === '#000' 
                                ? 'rgba(255,255,255,0.1)' 
                                : `${dotColor}20`,
                            borderWidth: dotColor === '#000000' || dotColor === '#000' ? 1 : 0,
                            borderColor: 'rgba(255,255,255,0.15)'
                        }}
                    >
                        <MaterialCommunityIcons 
                            name={getCatIcon() as keyof typeof MaterialCommunityIcons.glyphMap} 
                            size={22} 
                            color={dotColor === '#000000' || dotColor === '#000' ? '#FFFFFF' : dotColor} 
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-semibold text-base" numberOfLines={1}>
                            {item.nombre}
                        </Text>
                        <Text style={{ color: COLORS.text.muted }} className="text-xs mt-0.5">{item.marca}</Text>
                    </View>
                </View>

                <View className="items-end">
                    {item.esBajo && (
                        <View className="flex-row items-center rounded-lg px-2.5 py-1 mb-1.5" style={{ backgroundColor: COLORS.danger.bg }}>
                            <MaterialIcons name="error-outline" size={12} color={COLORS.danger.text} style={{ marginRight: 4 }} />
                            <Text className="text-[10px] font-bold tracking-widest" style={{ color: COLORS.danger.text }}>BAJO</Text>
                        </View>
                    )}
                    <View className="flex-row items-center">
                        <Text className="text-white font-bold text-lg mr-3">
                            {item.cantidadActual}{' '}
                            <Text style={{ color: COLORS.text.muted }} className="text-sm font-normal">{item.unidad}</Text>
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                // @ts-ignore
                                router.push({ pathname: '/(drawer)/inventory/edit', params: { item: JSON.stringify(item) } });
                            }}
                            className="p-2 rounded-lg ml-1"
                            style={{ backgroundColor: COLORS.primary.ghost }}
                        >
                            <MaterialIcons name="edit" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="flex-row items-center rounded-xl overflow-hidden" style={{ backgroundColor: COLORS.dark[200] }}>
                <TouchableOpacity
                    onPress={() => applyDelta(-10)}
                    disabled={loading}
                    className="flex-1 py-3 items-center"
                    activeOpacity={0.6}
                >
                    <Text style={{ color: COLORS.danger.DEFAULT }} className="font-bold text-sm">−10</Text>
                </TouchableOpacity>

                <View style={{ width: 1, height: 20, backgroundColor: COLORS.dark[300] }} />

                <TextInput
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardType="numeric"
                    className="flex-1 text-center text-white font-bold text-base py-3"
                    style={{ backgroundColor: 'transparent' }}
                />

                <View style={{ width: 1, height: 20, backgroundColor: COLORS.dark[300] }} />

                <TouchableOpacity
                    onPress={() => applyDelta(10)}
                    disabled={loading}
                    className="flex-1 py-3 items-center"
                    activeOpacity={0.6}
                >
                    <Text className="text-sm font-bold" style={{ color: COLORS.success.DEFAULT }}>+10</Text>
                </TouchableOpacity>

                <View style={{ width: 1, height: 20, backgroundColor: COLORS.dark[300] }} />

                <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={loading}
                    className="px-5 py-3 items-center"
                    activeOpacity={0.6}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.success.DEFAULT} />
                    ) : (
                        <MaterialIcons name="check-circle" size={22} color={COLORS.success.DEFAULT} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
        </Animated.View>
        </>
    );
}
