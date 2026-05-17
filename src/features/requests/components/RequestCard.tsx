import React from 'react';
import { CardRequest } from './CardRequest';
import type { SolicitudItem } from '../../../types/citas';

interface RequestCardProps {
    item: SolicitudItem;
    onPress: () => void;
}

const formatDate = (value: string | Date | null): string => {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const RequestCard = ({ item, onPress }: RequestCardProps) => (
    <CardRequest
        name={item.cliente?.nombre || item.clienteNombre || 'Sin nombre'}
        artist={item.artistaNombre || 'Sin asignar'}
        status={item.estado}
        recibido={formatDate(item.recibidaEn ?? item.recibido ?? null)}
        onPress={onPress}
    />
);
