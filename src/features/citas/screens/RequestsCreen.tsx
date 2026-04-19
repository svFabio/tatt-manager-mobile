import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { CitasAPI } from '../../../api/citas';
import { AppointmentCard } from '../components/AppointmentCard';
import type { EstadoCita, SolicitudItem, CitaItem } from '../../../types/citas';

const FILTERS: { label: string; value: EstadoCita | 'ALL' }[] = [
    { label: 'Todas', value: 'ALL' },
    { label: 'Pendientes', value: 'PENDIENTE' },
    { label: 'Confirmadas', value: 'CONFIRMADA' },
    { label: 'Finalizadas', value: 'FINALIZADA' },
    { label: 'Canceladas', value: 'CANCELADA' },
];

export default function RequestsScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<EstadoCita | 'ALL'>('ALL');
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<SolicitudItem[] | CitaItem[]>([]);

    useEffect(() => { load(activeFilter); }, [activeFilter]);

    const load = async (filter: EstadoCita | 'ALL') => {
        try {
            setLoading(true);
            if (filter === 'ALL') {
                const res = await CitasAPI.getSolicitudes();
                setRequests(res.data);
            } else {
                const res = await CitasAPI.getCitasPorEstado(filter);
                setRequests(res.data);
            }
        } catch (e) {
            console.error('[RequestsScreen]', e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = requests;

    return (
        <SafeAreaView className="flex-1 bg-[#0A0A0A]">
            <View className="px-4 pt-1 -mt-6 flex-1">

                <FlatList
                    horizontal
                    data={FILTERS}
                    keyExtractor={(f) => f.value}
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0 }}
                    contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
                    renderItem={({ item: f }) => {
                        const isActive = activeFilter === f.value;
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveFilter(f.value)}
                                activeOpacity={0.7}
                                className={`px-5 py-2 rounded-xl ${isActive ? 'bg-[#7E51FF]' : 'bg-[#1A1A1A]'}`}
                            >
                                <Text className={`text-ls font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />

                <Text className="text-gray-500 text-xs mb-4">
                    {filtered.length} solicitud{filtered.length !== 1 ? 'es' : ''}
                </Text>

                {loading ? (
                    <ActivityIndicator color="#7E51FF" size="large" className="mt-20" />
                ) : filtered.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <MaterialIcons name="inbox" size={48} color="#374151" />
                        <Text className="text-gray-600 mt-3 text-sm">Sin solicitudes</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <AppointmentCard
                                item={item}
                                onPress={() => router.push({ pathname: '/(drawer)/requests/[id]', params: { id: item.id } })}
                            />
                        )}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
