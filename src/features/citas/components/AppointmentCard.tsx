import React from 'react';
import { CardRequest } from './CardRequest';
import type { SolicitudItem } from '../../../types/citas';

interface AppointmentCardProps {
    item: SolicitudItem;
    onPress: () => void;
}

const formatDate = (value: string | Date | null): string => {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const AppointmentCard = ({ item, onPress }: AppointmentCardProps) => (
    <CardRequest
        name={item.clienteNombre || 'Sin nombre'}
        artist={item.artistaNombre || 'Sin asignar'}
        status={item.estado}
        recibido={formatDate(item.recibido)}
        onPress={onPress}
    />
);
