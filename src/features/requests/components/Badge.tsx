import { View, Text } from 'react-native';
import type { EstadoCita } from '../../../types/citas';

const VARIANT_STYLES: Record<EstadoCita, { bg: string; dot: string; text: string; border: string }> = {
    PENDIENTE: { bg: 'bg-purple-900/30', dot: 'bg-purple-400', text: 'text-purple-400', border: 'border-purple-800/50' },
    CONFIRMADA: { bg: 'bg-cyan-900/30', dot: 'bg-cyan-400', text: 'text-cyan-400', border: 'border-cyan-800/50' },
    FINALIZADA: { bg: 'bg-green-900/30', dot: 'bg-green-400', text: 'text-green-400', border: 'border-green-800/50' },
    CANCELADA: { bg: 'bg-red-900/30', dot: 'bg-red-400', text: 'text-red-400', border: 'border-red-800/50' },
};

interface BadgeProps {
    variant: EstadoCita;
}

export const Badge = ({ variant }: BadgeProps) => {
    const s = VARIANT_STYLES[variant] ?? VARIANT_STYLES.PENDIENTE;
    return (
        <View className={`flex-row items-center self-start px-3 py-1 rounded-full border ${s.bg} ${s.border}`}>
            <View className={`w-1.5 h-1.5 rounded-full mr-2 ${s.dot}`} />
            <Text className={`text-[10px] font-bold uppercase tracking-widest ${s.text}`}>{variant}</Text>
        </View>
    );
};
