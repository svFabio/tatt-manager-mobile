import { View } from "react-native";
import { Text } from "@/src/components/StyledText";
import type { EstadoCita } from '../../../types/citas';
import { COLORS } from '../../../theme/colors';

const VARIANT_STYLES: Record<EstadoCita, { bg: string; dot: string; text: string; border: string }> = {
    PENDIENTE: {
        bg: COLORS.status.pendiente.bg,
        dot: COLORS.status.pendiente.text,
        text: COLORS.status.pendiente.text,
        border: COLORS.status.pendiente.bg,
    },
    CONFIRMADA: {
        bg: COLORS.status.confirmada.bg,
        dot: COLORS.status.confirmada.text,
        text: COLORS.status.confirmada.text,
        border: COLORS.status.confirmada.bg,
    },
    FINALIZADA: {
        bg: COLORS.status.finalizada.bg,
        dot: COLORS.status.finalizada.text,
        text: COLORS.status.finalizada.text,
        border: COLORS.status.finalizada.bg,
    },
    CANCELADA: {
        bg: COLORS.status.cancelada.bg,
        dot: COLORS.status.cancelada.text,
        text: COLORS.status.cancelada.text,
        border: COLORS.status.cancelada.bg,
    },
};

interface BadgeProps {
    variant: EstadoCita;
}

export const Badge = ({ variant }: BadgeProps) => {
    const s = VARIANT_STYLES[variant] ?? VARIANT_STYLES.PENDIENTE;
    return (
        <View
            className="flex-row items-center self-start px-3 py-1 rounded-full"
            style={{ backgroundColor: s.bg, borderWidth: 1, borderColor: s.border }}
        >
            <View className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: s.dot }} />
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: s.text }}>
                {variant}
            </Text>
        </View>
    );
};
