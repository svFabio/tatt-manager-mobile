import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import { CitasAPI } from '../../../api/citas';
import type { CitaDetails } from '../../../types/citas';
import { DetalleHeader } from '../components/DetalleHeader';
import { DetalleCliente } from '../components/DetalleCliente';
import { DetalleReferencia } from '../components/DetalleReferencia';
import { DetalleCotizacion } from '../components/DetalleCotizacion';
import { COLORS } from '../../../theme/colors';

export default function DetalleSolicitudScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [detalle, setDetalle] = useState<CitaDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        CitasAPI.getDetalleCita(Number(id))
            .then((res) => setDetalle(res.data))
            .catch((e) => console.error('[DetalleSolicitud]', e))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
            <ActivityIndicator color={COLORS.primary.DEFAULT} size="large" />
        </SafeAreaView>
    );

    if (!detalle) return (
        <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: COLORS.bg }}>
            <MaterialIcons name="error-outline" size={48} color={COLORS.text.muted} />
            <Text className="mt-3 text-sm text-center" style={{ color: COLORS.text.secondary }}>No se pudo cargar la solicitud</Text>
        </SafeAreaView>
    );

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bg }}>
            <DetalleHeader />
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <DetalleCliente detalle={detalle} />
                <DetalleReferencia uri={detalle.referencia} />
                <DetalleCotizacion solicitudId={Number(id)} estado={detalle.estado} />
            </ScrollView>
        </SafeAreaView>
    );
}
