import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { InventarioAPI } from '../../../api/inventario';
import type { InventarioItem, InventarioStats } from '../../../types/inventario';
import { StatCard } from '../components/StatCard';
import { InventarioItemCard } from '../components/InventarioItemCard';

export default function InventarioScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<InventarioStats>({ totalItems: 0, enStockBajo: 0, enStockNormal: 0 });
    const [items, setItems] = useState<InventarioItem[]>([]);
    const [buscar, setBuscar] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const load = useCallback(async (query?: string) => {
        try {
            setLoading(true);
            const res = await InventarioAPI.getInventario(query);
            if (res.ok) {
                setStats(res.data.stats);
                setItems(res.data.items);
            }
        } catch (e) {
            console.error('[InventarioScreen]', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useFocusEffect(useCallback(() => {
        load();
    }, [load]));

    const handleSearch = (text: string) => {
        setBuscar(text);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => load(text || undefined), 400);
    };

    const handleUpdated = (updated: InventarioItem) => {
        setItems((prev) =>
            prev.map((i) => (i.tipo === updated.tipo && i.refId === updated.refId ? updated : i))
        );
        // Recalculate stats locally
        setStats((prev) => {
            const newItems = items.map((i) =>
                i.tipo === updated.tipo && i.refId === updated.refId ? updated : i
            );
            const enStockBajo = newItems.filter((i) => i.esBajo).length;
            return { ...prev, enStockBajo, enStockNormal: prev.totalItems - enStockBajo };
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0A0A0A]">
            {/* Header fijo */}
            <View className="px-4 -mt-6">
                <StatCard label="TOTAL ITEMS" value={stats.totalItems} />
                <StatCard label="ITEMS EN STOCK NORMAL" value={stats.enStockNormal} />
                <StatCard label="ITEMS EN STOCK BAJO" value={stats.enStockBajo} variant="bajo" />

                <View className="flex-row items-center bg-dark-100 rounded-xl px-3 mb-4 mt-1">
                    <MaterialIcons name="search" size={20} color="#6B7280" />
                    <TextInput
                        value={buscar}
                        onChangeText={handleSearch}
                        placeholder="Search inventory..."
                        placeholderTextColor="#6B7280"
                        className="flex-1 text-white py-3 px-2 text-sm"
                    />
                </View>
            </View>

            {/* Lista */}
            <View className="flex-1 px-4">
                {loading ? (
                    <ActivityIndicator color="#D4AF37" size="large" className="mt-10" />
                ) : items.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <MaterialIcons name="inventory" size={48} color="#374151" />
                        <Text className="text-gray-600 mt-3 text-sm">Sin items en inventario</Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(i) => `${i.tipo}-${i.refId}`}
                        renderItem={({ item }) => (
                            <InventarioItemCard item={item} onUpdated={handleUpdated} />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>
            {/* FAB */}
            <TouchableOpacity
                onPress={() => router.push('/(drawer)/inventory/agregar')}
                className="absolute bottom-8 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{ backgroundColor: '#D4AF37' }}
            >
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
