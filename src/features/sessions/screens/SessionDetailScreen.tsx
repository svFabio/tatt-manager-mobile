import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionsAPI, type SessionDetail } from '../../../api/sessions';
import { COLORS } from '../../../theme/colors';

interface Props {
  sessionId: number;
}

const formatDate = (value: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
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
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
};

export default function SessionDetailScreen({ sessionId }: Props) {
  const router = useRouter();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SessionsAPI.getById(sessionId)
      .then((res) => setDetail(res.data))
      .catch((e) => console.error('[SessionDetail]', e))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading)
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color={COLORS.primary.DEFAULT} size="large" />
      </SafeAreaView>
    );

  if (!detail)
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center px-6">
        <MaterialIcons name="error-outline" size={48} color="#374151" />
        <Text className="text-gray-500 mt-3 text-sm text-center">No se pudo cargar el detalle</Text>
      </SafeAreaView>
    );

  const hasCaps = detail.capsUsadas && detail.capsUsadas.length > 0;
  const hasAgujas = detail.agujasUsadas && detail.agujasUsadas.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['bottom']}>
      {/* ─── Header ─── */}
      <View
        className="flex-row items-center px-4"
        style={{
          height: 64,
          backgroundColor: COLORS.bg,
          borderBottomWidth: 0,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 rounded-xl">
          <MaterialIcons name="arrow-back" size={20} color={COLORS.primary.light} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold" style={{ letterSpacing: -0.45 }}>
          Detalle de Sesión
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 40, gap: 13 }}>
        {/* ─── Artist Info ─── */}
        <View className="flex-row items-center" style={{ gap: 16 }}>
          <View
            className="rounded-xl items-center justify-center"
            style={{
              width: 56,
              height: 56,
              backgroundColor: COLORS.dark[100],
              borderWidth: 1,
              borderColor: COLORS.border.subtle,
            }}
          >
            <View
              className="rounded-xl items-center justify-center"
              style={{ width: 54, height: 54, backgroundColor: COLORS.dark[200], borderWidth: 1, borderColor: COLORS.border.subtle }}
            >
              <Text style={{ color: COLORS.primary.DEFAULT, fontWeight: '700', fontSize: 14 }}>
                {getInitials(detail.artista.nombre)}
              </Text>
            </View>
          </View>
          <View>
            <Text style={{ color: COLORS.text.muted, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}>
              ARTISTA
            </Text>
            <Text className="text-white text-xl font-bold" style={{ letterSpacing: -0.5 }}>
              {detail.artista.nombre}
            </Text>
          </View>
        </View>

        {/* ─── Bento Grid: Client / Date / Duration / Zone ─── */}
        <View
          className="rounded-2xl"
          style={{
            backgroundColor: COLORS.dark[100],
            borderWidth: 1,
            borderColor: COLORS.border.subtle,
            height: 124,
          }}
        >
          {/* Row 1 */}
          <View className="flex-row" style={{ height: 62 }}>
            {/* Client */}
            <View
              className="flex-1 justify-center px-4"
              style={{ borderRightWidth: 1, borderRightColor: COLORS.border.subtle }}
            >
              <Text style={{ color: COLORS.text.muted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                CLIENTE
              </Text>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <MaterialIcons name="person" size={10} color={COLORS.primary.light} />
                <Text className="text-white text-sm font-bold">{detail.cliente?.nombre ?? '—'}</Text>
              </View>
            </View>
            {/* Date */}
            <View className="flex-1 justify-center px-4">
              <Text style={{ color: COLORS.text.muted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                FECHA
              </Text>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <MaterialIcons name="event" size={10} color="#00AFFE" />
                <Text className="text-white text-sm font-semibold">{formatDate(detail.cerradaEn)}</Text>
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View className="flex-row" style={{ height: 62 }}>
            {/* Duration */}
            <View
              className="flex-1 justify-center px-4"
              style={{ borderRightWidth: 1, borderRightColor: COLORS.border.subtle }}
            >
              <Text style={{ color: COLORS.text.muted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                DURACIÓN
              </Text>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <MaterialIcons name="schedule" size={10} color={COLORS.primary.light} />
                <Text className="text-white text-sm font-semibold">{formatDuration(detail.duracionEnHoras)}</Text>
              </View>
            </View>
            {/* Zone */}
            <View className="flex-1 justify-center px-4">
              <Text style={{ color: COLORS.text.muted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                ZONA
              </Text>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <MaterialIcons name="place" size={10} color="#00A7F2" />
                <Text className="text-white text-sm font-bold">{detail.cita?.zonaDelCuerpo || detail.cita?.solicitud?.zonaDelCuerpo || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Resultado Final (Photo) ─── */}
        <View className="rounded-2xl p-6 items-center" style={{ backgroundColor: COLORS.dark[100] }}>
          <Text
            style={{
              color: COLORS.text.muted,
              fontSize: 14,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              alignSelf: 'flex-start',
              marginBottom: 16,
            }}
          >
            RESULTADO FINAL
          </Text>
          {detail.fotoResultadoUrl ? (
            <View className="rounded-3xl overflow-hidden" style={{ width: 157, height: 103, backgroundColor: COLORS.dark[100], borderWidth: 1, borderColor: COLORS.border.subtle }}>
              <Image
                source={{ uri: detail.fotoResultadoUrl }}
                style={{ width: 157, height: 103 }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View className="items-center justify-center" style={{ width: 157, height: 103, backgroundColor: COLORS.dark[200], borderRadius: 24, borderWidth: 1, borderColor: COLORS.border.subtle }}>
              <MaterialIcons name="photo-camera" size={32} color={COLORS.text.dimmed} />
              <Text style={{ color: COLORS.text.muted, fontSize: 10, marginTop: 4 }}>Sin foto</Text>
            </View>
          )}
        </View>

        {/* ─── Material Breakdown ─── */}
        {(hasCaps || hasAgujas) && (
          <View style={{ paddingTop: 16 }}>
            {/* Section header */}
            <View
              className="flex-row items-center justify-between pb-4"
              style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border.subtle }}
            >
              <Text className="text-white text-2xl font-bold" style={{ letterSpacing: -0.6 }}>
                Desglose de Materiales
              </Text>
              <MaterialIcons name="inventory-2" size={20} color={COLORS.primary.light} />
            </View>

            {/* Caps de Tinta */}
            {hasCaps && (
              <View className="rounded-2xl p-6 mt-6" style={{ backgroundColor: COLORS.dark[100] }}>
                <View className="flex-row items-center mb-4" style={{ gap: 12 }}>
                  <MaterialIcons name="opacity" size={16} color="#00AFFE" />
                  <Text className="text-white text-base font-semibold">Caps de Tinta</Text>
                </View>

                <View style={{ gap: 12 }}>
                  {detail.capsUsadas.map((cap) => (
                    <View
                      key={cap.id}
                      className="flex-row items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: COLORS.dark[200], borderWidth: 1, borderColor: COLORS.border.subtle }}
                    >
                      <View className="flex-row items-center" style={{ gap: 12 }}>
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 12,
                            backgroundColor: cap.tinta.colorHex || '#111',
                            borderWidth: 1,
                            borderColor: '#484847',
                          }}
                        />
                        <View>
                          <Text className="text-white text-sm font-medium">{cap.tinta.nombre}</Text>
                          <Text style={{ color: COLORS.text.muted, fontSize: 10 }}>{cap.tinta.marca}</Text>
                        </View>
                      </View>
                      <View className="flex-row" style={{ gap: 8 }}>
                        <View className="px-2 py-1 rounded" style={{ backgroundColor: COLORS.dark[100] }}>
                          <Text style={{ color: COLORS.text.muted, fontSize: 12, fontFamily: 'monospace' }}>
                            {cap.cantidadUsada} {cap.tamanioCap[0]}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Agujas */}
            {hasAgujas && (
              <View className="rounded-2xl p-6 mt-6" style={{ backgroundColor: COLORS.dark[100] }}>
                <View className="flex-row items-center mb-4" style={{ gap: 12 }}>
                  <MaterialIcons name="push-pin" size={16} color={COLORS.primary.light} />
                  <Text className="text-white text-base font-semibold">Agujas</Text>
                </View>

                <View style={{ gap: 12 }}>
                  {detail.agujasUsadas.map((au) => (
                    <View
                      key={au.id}
                      className="flex-row items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: COLORS.dark[200], borderWidth: 1, borderColor: COLORS.border.subtle }}
                    >
                      <View>
                        <Text className="text-white text-sm font-semibold">{au.aguja.nombre}</Text>
                        <Text
                          style={{
                            color: COLORS.text.muted,
                            fontSize: 10,
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                          }}
                        >
                          {au.aguja.marca} - {au.aguja.tipo}
                        </Text>
                      </View>
                      <View className="px-2 py-1 rounded" style={{ backgroundColor: COLORS.dark[100] }}>
                        <Text style={{ color: COLORS.text.muted, fontSize: 12, fontFamily: 'monospace' }}>
                          {au.cantidadUsada} UNID
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
