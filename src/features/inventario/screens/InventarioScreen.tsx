import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import { InventarioAPI } from '../../../api/inventario';
import type { InventarioItem, InventarioStats } from '../../../types/inventario';
import { StatCard } from '../components/StatCard';
import { InventarioItemCard } from '../components/InventarioItemCard';
import { COLORS, PRIMARY_SHADOW } from '../../../theme/colors';

export default function InventarioScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<InventarioStats>({ totalItems: 0, enStockBajo: 0, enStockNormal: 0 });
    const [items, setItems] = useState<InventarioItem[]>([]);
    const [buscar, setBuscar] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fabScale = useRef(new Animated.Value(0)).current;
    const [searchFocused, setSearchFocused] = useState(false);

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
        Animated.spring(fabScale, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
        }).start();
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
        setStats((prev) => {
            const newItems = items.map((i) =>
                i.tipo === updated.tipo && i.refId === updated.refId ? updated : i
            );
            const enStockBajo = newItems.filter((i) => i.esBajo).length;
            return { ...prev, enStockBajo, enStockNormal: prev.totalItems - enStockBajo };
        });
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
            {/* Header fijo */}
            <View className="px-4 -mt-6">
                {/* Stats en fila horizontal */}
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <StatCard label="TOTAL" value={stats.totalItems} />
                    </View>
                    <View className="flex-1">
                        <StatCard label="NORMAL" value={stats.enStockNormal} />
                    </View>
                    <View className="flex-1">
                        <StatCard label="BAJO" value={stats.enStockBajo} variant="bajo" />
                    </View>
                </View>

                {/* Barra de búsqueda */}
                <View
                    className="flex-row items-center rounded-xl px-3 mb-4 mt-1"
                    style={{
                        backgroundColor: COLORS.dark[100],
                        borderWidth: 1.5,
                        borderColor: searchFocused ? COLORS.primary.DEFAULT : COLORS.border.subtle,
                    }}
                >
                    <MaterialIcons name="search" size={20} color={searchFocused ? COLORS.primary.DEFAULT : COLORS.text.muted} />
                    <TextInput
                        value={buscar}
                        onChangeText={handleSearch}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Buscar en inventario..."
                        placeholderTextColor={COLORS.text.dimmed}
                        className="flex-1 text-white py-3 px-2 text-sm"
                    />
                    {buscar.length > 0 && (
                        <TouchableOpacity onPress={() => { setBuscar(''); load(); }} className="p-1">
                            <MaterialIcons name="close" size={18} color={COLORS.text.muted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Lista */}
            <View className="flex-1 px-4">
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={COLORS.primary.DEFAULT} size="large" />
                        <Text style={{ color: COLORS.text.muted }} className="text-xs mt-3">Cargando inventario...</Text>
                    </View>
                ) : items.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <View
                            className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
                            style={{ backgroundColor: COLORS.primary.ghost }}
                        >
                            <MaterialIcons name="inventory" size={36} color={COLORS.primary.DEFAULT} />
                        </View>
                        <Text style={{ color: COLORS.text.secondary }} className="text-base font-semibold">Sin items en inventario</Text>
                        <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">Toca + para agregar tu primer ítem</Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(i) => `${i.tipo}-${i.refId}`}
                        renderItem={({ item, index }) => (
                            <InventarioItemCard item={item} onUpdated={handleUpdated} index={index} />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>

            {/* FAB */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 32,
                    right: 24,
                    transform: [{ scale: fabScale }],
                }}
            >
                <TouchableOpacity
                    onPress={() => router.push('/(drawer)/inventory/agregar')}
                    className="w-16 h-16 rounded-2xl items-center justify-center"
                    style={{
                        backgroundColor: COLORS.primary.DEFAULT,
                        ...PRIMARY_SHADOW,
                    }}
                    activeOpacity={0.85}
                >
                    <MaterialIcons name="add" size={30} color={COLORS.text.primary} />
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}
