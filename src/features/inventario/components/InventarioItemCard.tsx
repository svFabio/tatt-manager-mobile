import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { InventarioAPI } from '../../../api/inventario';
import type { InventarioItem } from '../../../types/inventario';
import { StockInsuficienteModal } from './StockInsuficienteModal';

interface Props {
    item: InventarioItem;
    onUpdated: (updated: InventarioItem) => void;
}

export function InventarioItemCard({ item, onUpdated }: Props) {
    const [inputValue, setInputValue] = useState(item.cantidadActual.toString());
    const [loading, setLoading]       = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

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
        } catch (e: any) {
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

    const dotColor = item.colorHex ?? '#6B7280';

    return (
        <>
        <StockInsuficienteModal
            visible={modalVisible}
            nombre={item.nombre}
            cantidad={item.cantidadActual}
            unidad={item.unidad}
            onClose={() => setModalVisible(false)}
        />
        <View className="bg-[#1A1A1A] rounded-2xl p-4 mb-3">
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center flex-1 mr-2">
                    <View
                        className="w-3 h-3 rounded-full mr-3 mt-1"
                        style={{ backgroundColor: dotColor }}
                    />
                    <View className="flex-1">
                        <Text className="text-white font-semibold text-base" numberOfLines={1}>
                            {item.nombre}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-0.5">{item.marca}</Text>
                    </View>
                </View>

                <View className="items-end">
                    {item.esBajo && (
                        <View className="bg-red-900 rounded px-2 py-0.5 mb-1">
                            <Text className="text-red-400 text-xs font-bold">BAJO</Text>
                        </View>
                    )}
                    <Text className="text-white font-bold text-lg">
                        {item.cantidadActual}{' '}
                        <Text className="text-gray-500 text-sm font-normal">{item.unidad}</Text>
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center bg-[#0A0A0A] rounded-xl overflow-hidden">
                <TouchableOpacity
                    onPress={() => applyDelta(-10)}
                    disabled={loading}
                    className="flex-1 py-3 items-center"
                >
                    <Text className="text-white font-semibold">-10</Text>
                </TouchableOpacity>

                <TextInput
                    value={inputValue}
                    onChangeText={setInputValue}
                    keyboardType="numeric"
                    className="flex-1 text-center text-white font-bold text-base bg-[#2A2A2A] py-3"
                />

                <TouchableOpacity
                    onPress={() => applyDelta(10)}
                    disabled={loading}
                    className="flex-1 py-3 items-center"
                >
                    <Text className="text-[#7E51FF] font-semibold">+10</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={loading}
                    className="px-4 py-3 items-center"
                >
                    <MaterialIcons name="check" size={20} color="#22C55E" />
                </TouchableOpacity>
            </View>
        </View>
        </>
    );
}
