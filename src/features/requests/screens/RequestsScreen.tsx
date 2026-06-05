import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { CitasAPI } from '../../../api/citas';
import { socket } from '../../../api/socket';
import { RequestCard } from '../components/RequestCard';
import type { SolicitudItem } from '../../../types/citas';
import { COLORS } from '../../../theme/colors';

type EstadoSolicitud = 'PENDIENTE' | 'COTIZADA';

const FILTERS: { label: string; value: EstadoSolicitud | 'ALL'; icon: keyof typeof MaterialIcons.glyphMap; activeColor: string }[] = [
    { label: 'Todas',      value: 'ALL',        icon: 'list',           activeColor: COLORS.primary.DEFAULT },
    { label: 'Nuevas',     value: 'PENDIENTE',  icon: 'schedule',       activeColor: COLORS.status.pendiente.text },
    { label: 'Cotizadas',  value: 'COTIZADA',   icon: 'attach-money',   activeColor: COLORS.status.confirmada.text },
];

export default function RequestsScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<EstadoSolicitud | 'ALL'>('ALL');
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

    const counts = useMemo(() => ({
        ALL: requests.length,
        PENDIENTE: requests.filter(r => r.estado === 'PENDIENTE').length,
        COTIZADA: requests.filter(r => r.estado === 'COTIZADA').length,
    }), [requests]);

    const filtered = activeFilter === 'ALL'
        ? requests
        : requests.filter((r) => r.estado === activeFilter);

    const emptyMessages: Record<string, { title: string; subtitle: string }> = {
        ALL:        { title: 'Sin solicitudes',             subtitle: 'Aparecerán aquí cuando lleguen' },
        PENDIENTE:  { title: 'Sin solicitudes nuevas',      subtitle: 'No hay solicitudes pendientes de cotizar' },
        COTIZADA:   { title: 'Sin cotizaciones',            subtitle: 'Las solicitudes cotizadas aparecerán aquí' },
    };

    const emptyState = emptyMessages[activeFilter] ?? emptyMessages.ALL;

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
                        const count = counts[f.value];
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveFilter(f.value)}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    backgroundColor: COLORS.dark[100],
                                    borderWidth: 1,
                                    borderColor: isActive ? f.activeColor : 'transparent',
                                    gap: 6,
                                }}
                            >
                                <MaterialIcons
                                    name={f.icon}
                                    size={14}
                                    color={COLORS.text.primary} // Iconos blancos
                                />
                                <Text
                                    style={{
                                        includeFontPadding: false,
                                        lineHeight: 18,
                                        fontSize: 13,
                                        fontWeight: '600',
                                        color: isActive ? f.activeColor : COLORS.text.primary,
                                    }}
                                >
                                    {f.label}
                                </Text>
                                {count > 0 && (
                                    <View style={{
                                        backgroundColor: isActive ? `${f.activeColor}20` : COLORS.dark[200],
                                        borderRadius: 8,
                                        paddingHorizontal: 6,
                                        paddingVertical: 1,
                                        minWidth: 20,
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{
                                            fontSize: 11,
                                            fontWeight: '700',
                                            color: isActive ? f.activeColor : COLORS.text.muted,
                                        }}>
                                            {count}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    }}
                />

                <Text style={{ includeFontPadding: false, lineHeight: 20, color: COLORS.text.secondary }} className="text-xs mb-4 pb-1">
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
                        <Text style={{ color: COLORS.text.secondary }} className="text-base font-semibold">{emptyState.title}</Text>
                        <Text style={{ color: COLORS.text.muted }} className="text-sm mt-1">{emptyState.subtitle}</Text>
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

