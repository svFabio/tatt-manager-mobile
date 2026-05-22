import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/StyledText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { SessionListItem } from '../../../api/sessions';
import { COLORS } from '../../../theme/colors';

interface Props {
  session: SessionListItem;
  onPress: () => void;
}

const formatDate = (value: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
};

const formatDuration = (hours: string | number): string => {
  const h = Number(hours);
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h 00m`;
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

export const SessionCard = ({ session, onPress }: Props) => {
  const totalCaps = session.capsUsadas.reduce((sum, c) => sum + c.cantidadUsada, 0);
  const totalAgujas = session.agujasUsadas.reduce((sum, a) => sum + a.cantidadUsada, 0);
  const hasMaterials = totalCaps > 0 || totalAgujas > 0;
  
  // Use primary color dynamically or default avatar color strategy from theme
  const avatarColor = session.artista.id % 2 === 0 ? COLORS.primary.light : COLORS.primary.DEFAULT;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="px-4 py-5"
      style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border.subtle }}
    >
      {/* ─── Top row: avatar + info ─── */}
      <View className="flex-row items-center">
        {/* Avatar */}
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: COLORS.dark[200], borderWidth: 1, borderColor: COLORS.border.subtle }}
        >
          <Text className="text-sm font-bold" style={{ color: avatarColor }}>
            {getInitials(session.artista.nombre)}
          </Text>
        </View>

        {/* Name + Badge + Meta */}
        <View className="ml-4 flex-1">
          <View className="flex-row items-center gap-2">
            <Text style={{ color: COLORS.text.primary }} className="text-base font-bold">{session.artista.nombre}</Text>
            <View className="px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: COLORS.success.DEFAULT + '20' }}>
              <Text
                className="text-[9px] font-bold tracking-[0.45px] uppercase"
                style={{ color: COLORS.success.DEFAULT }}
              >
                COMPLETADA
              </Text>
            </View>
          </View>

          {/* Date · Duration · Zone */}
          <View className="flex-row items-center mt-1" style={{ gap: 6 }}>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <MaterialIcons name="event" size={11} color={COLORS.text.secondary} />
              <Text className="text-xs" style={{ color: COLORS.text.secondary }}>{formatDate(session.cerradaEn)}</Text>
            </View>
            <Text className="text-xs" style={{ color: COLORS.text.dimmed }}>|</Text>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <MaterialIcons name="schedule" size={11} color={COLORS.text.secondary} />
              <Text className="text-xs" style={{ color: COLORS.text.secondary }}>{formatDuration(session.duracionEnHoras)}</Text>
            </View>
            {session.cita?.zonaDelCuerpo && (
              <>
                <Text className="text-xs" style={{ color: COLORS.text.dimmed }}>|</Text>
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <MaterialIcons name="edit" size={11} color={COLORS.text.secondary} />
                  <Text className="text-xs" style={{ color: COLORS.text.secondary }} numberOfLines={1}>
                    {session.cita.zonaDelCuerpo}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* ─── Material summary row ─── */}
      {hasMaterials && (
        <View
          className="flex-row items-center justify-between mt-4 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: COLORS.border.subtle }}
        >
          <View>
            <Text
              className="text-[10px] font-bold tracking-widest uppercase mb-1"
              style={{ color: COLORS.text.muted }}
            >
              MATERIAL CONSUMIDO
            </Text>
            <View className="flex-row items-center" style={{ gap: 16 }}>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Text className="text-xs" style={{ color: COLORS.text.secondary }}>Caps:</Text>
                <Text className="text-sm font-black" style={{ color: COLORS.text.primary }}>{totalCaps}</Text>
              </View>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Text className="text-xs" style={{ color: COLORS.text.secondary }}>Agujas:</Text>
                <Text className="text-sm font-black" style={{ color: COLORS.primary.light }}>{totalAgujas}</Text>
              </View>
            </View>
          </View>

          {/* Chevron */}
          <MaterialIcons name="chevron-right" size={16} color={COLORS.text.dimmed} />
        </View>
      )}

      {/* If no materials, show a subtle chevron anyway */}
      {!hasMaterials && (
        <View className="flex-row justify-end mt-2">
          <MaterialIcons name="chevron-right" size={16} color={COLORS.text.dimmed} />
        </View>
      )}
    </TouchableOpacity>
  );
};
