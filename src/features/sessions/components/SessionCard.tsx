import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { SessionListItem } from '../../../api/sessions';

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

// Alternate colours between artists for visual distinction
const AVATAR_COLORS = ['#D4AF37', '#00A7F2'];

export const SessionCard = ({ session, onPress }: Props) => {
  const totalCaps = session.capsUsadas.reduce((sum, c) => sum + c.cantidadUsada, 0);
  const totalAgujas = session.agujasUsadas.reduce((sum, a) => sum + a.cantidadUsada, 0);
  const hasMaterials = totalCaps > 0 || totalAgujas > 0;
  const avatarColor = session.artista.id % 2 === 0 ? AVATAR_COLORS[1] : AVATAR_COLORS[0];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="px-4 py-5"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}
    >
      {/* ─── Top row: avatar + info ─── */}
      <View className="flex-row items-center">
        {/* Avatar */}
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#262626', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <Text style={{ color: avatarColor, fontWeight: '700', fontSize: 14 }}>
            {getInitials(session.artista.nombre)}
          </Text>
        </View>

        {/* Name + Badge + Meta */}
        <View className="ml-4 flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-base font-bold">{session.artista.nombre}</Text>
            <View className="px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: 'rgba(0,175,254,0.1)' }}>
              <Text
                style={{
                  color: '#00AFFE',
                  fontSize: 9,
                  fontWeight: '700',
                  letterSpacing: 0.45,
                  textTransform: 'uppercase',
                }}
              >
                COMPLETADA
              </Text>
            </View>
          </View>

          {/* Date · Duration · Zone */}
          <View className="flex-row items-center mt-1" style={{ gap: 6 }}>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <MaterialIcons name="event" size={11} color="#ADAAAA" />
              <Text style={{ color: '#ADAAAA', fontSize: 12 }}>{formatDate(session.cerradaEn)}</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>|</Text>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <MaterialIcons name="schedule" size={11} color="#ADAAAA" />
              <Text style={{ color: '#ADAAAA', fontSize: 12 }}>{formatDuration(session.duracionEnHoras)}</Text>
            </View>
            {session.cita?.zonaDelCuerpo && (
              <>
                <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>|</Text>
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <MaterialIcons name="edit" size={11} color="#ADAAAA" />
                  <Text style={{ color: '#ADAAAA', fontSize: 12 }} numberOfLines={1}>
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
          style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}
        >
          <View>
            <Text
              style={{
                color: '#ADAAAA',
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              MATERIAL CONSUMIDO
            </Text>
            <View className="flex-row items-center" style={{ gap: 16 }}>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Text style={{ color: '#ADAAAA', fontSize: 12 }}>Caps:</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>{totalCaps}</Text>
              </View>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Text style={{ color: '#ADAAAA', fontSize: 12 }}>Agujas:</Text>
                <Text style={{ color: '#D4AF37', fontSize: 14, fontWeight: '900' }}>{totalAgujas}</Text>
              </View>
            </View>
          </View>

          {/* Chevron */}
          <MaterialIcons name="chevron-right" size={16} color="#ADAAAA" />
        </View>
      )}

      {/* If no materials, show a subtle chevron anyway */}
      {!hasMaterials && (
        <View className="flex-row justify-end mt-2">
          <MaterialIcons name="chevron-right" size={16} color="#ADAAAA" />
        </View>
      )}
    </TouchableOpacity>
  );
};
