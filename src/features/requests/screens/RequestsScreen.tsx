import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { CitasAPI } from '../../../api/citas';
import { socket } from '../../../api/socket';
import { RequestCard } from '../components/RequestCard';
import type { EstadoCita, SolicitudItem } from '../../../types/citas';
import { COLORS } from '../../../theme/colors';

const FILTERS: { label: string; value: EstadoCita | 'ALL' }[] = [
    { label: 'Todas',       value: 'ALL'        },
    { label: 'Pendientes',  value: 'PENDIENTE'  },
    { label: 'Confirmadas', value: 'CONFIRMADA' },
    { label: 'Finalizadas', value: 'FINALIZADA' },
    { label: 'Canceladas',  value: 'CANCELADA'  },
];

export default function RequestsScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<EstadoCita | 'ALL'>('ALL');
    const [loading, setLoading]           = useState(true);
    const [requests, setRequests]         = useState<SolicitudItem[]>([]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await CitasAPI.getSolicitudes();
            setRequests(res.data);
        } catch (e) {
            console.error('[RequestsScreen]', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        socket.on('nueva-solicitud', load);
        socket.on('new-whatsapp-request', load);
        return () => {
            socket.off('nueva-solicitud', load);
            socket.off('new-whatsapp-request', load);
        };
    }, [load]);

    const filtered = activeFilter === 'ALL'
        ? requests
        : requests.filter((r) => r.estado === activeFilter);

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
            <View className="px-4 -mt-6">
                <FlatList
                    horizontal
                    data={FILTERS}
                    keyExtractor={(f) => f.value}
                    showsHorizontalScrollIndicator={false}
                    style={{ height: 64 }}
                    contentContainerStyle={{ gap: 8, paddingVertical: 10, alignItems: 'center' }}
                    renderItem={({ item: f }) => {
                        const isActive = activeFilter === f.value;
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveFilter(f.value)}
                                activeOpacity={0.7}
                                className={`px-5 py-3 rounded-xl justify-center items-center ${isActive ? 'bg-primary' : 'bg-dark-100'}`}
                            >
                                <Text
                                    style={{ includeFontPadding: false, lineHeight: 22 }}
                                    className={`text-sm font-bold pb-0.5 ${isActive ? 'text-white' : 'text-gray-400'}`}
                                >
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />

                <Text style={{ includeFontPadding: false, lineHeight: 20 }} className="text-gray-500 text-xs mb-4 pb-1">
                    {filtered.length} solicitud{filtered.length !== 1 ? 'es' : ''}
                </Text>
            </View>

            <View className="flex-1 px-4">
                {loading ? (
                    <ActivityIndicator color={COLORS.primary.DEFAULT} size="large" className="mt-20" />
                ) : filtered.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <View
                            className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
                            style={{ backgroundColor: COLORS.primary.ghost }}
                        >
                            <MaterialIcons name="inbox" size={36} color={COLORS.primary.DEFAULT} />
                        </View>
                        <Text style={{ color: COLORS.text.secondary }} className="text-base font-semibold">Sin solicitudes</Text>
                        <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">Aparecerán aquí cuando lleguen</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <RequestCard
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
