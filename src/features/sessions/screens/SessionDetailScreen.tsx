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
        <MaterialIcons name="error-outline" size={48} color={COLORS.text.dimmed} />
        <Text className="mt-3 text-sm text-center" style={{ color: COLORS.text.secondary }}>No se pudo cargar el detalle</Text>
      </SafeAreaView>
    );

  const hasCaps = detail.capsUsadas && detail.capsUsadas.length > 0;
  const hasAgujas = detail.agujasUsadas && detail.agujasUsadas.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={['bottom']}>
      {/* ─── Header ─── */}
      <View
        className="flex-row items-center px-4 h-16 bg-bg border-b-0"
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 rounded-xl">
          <MaterialIcons name="arrow-back" size={20} color={COLORS.primary.light} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold tracking-tight">
          Detalle de Sesión
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerClassName="pt-6 pb-10 gap-[13px]">
        {/* ─── Artist Info ─── */}
        <View className="flex-row items-center gap-4">
          <View className="rounded-xl items-center justify-center w-14 h-14 bg-dark-100 border border-border-subtle">
            <View className="rounded-xl items-center justify-center w-[54px] h-[54px] bg-dark-200 border border-border-subtle">
              <Text className="text-primary font-bold text-sm">
                {getInitials(detail.artista.nombre)}
              </Text>
            </View>
          </View>
          <View>
            <Text className="text-text-muted text-xs tracking-[1.2px] uppercase">
              ARTISTA
            </Text>
            <Text className="text-white text-xl font-bold tracking-tight">
              {detail.artista.nombre}
            </Text>
          </View>
        </View>

        {/* ─── Bento Grid: Client / Date / Duration / Zone ─── */}
        <View className="rounded-2xl bg-dark-100 border border-border-subtle h-[124px]">
          {/* Row 1 */}
          <View className="flex-row h-[62px]">
            {/* Client */}
            <View className="flex-1 justify-center px-4 border-r border-border-subtle">
              <Text className="text-text-muted text-[10px] tracking-widest uppercase mb-0.5">
                CLIENTE
              </Text>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="person" size={10} color={COLORS.primary.light} />
                <Text className="text-white text-sm font-bold">{detail.cliente?.nombre ?? '—'}</Text>
              </View>
            </View>
            {/* Date */}
            <View className="flex-1 justify-center px-4">
              <Text className="text-text-muted text-[10px] tracking-widest uppercase mb-0.5">
                FECHA
              </Text>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="event" size={10} color={COLORS.primary.light} />
                <Text className="text-white text-sm font-semibold">{formatDate(detail.cerradaEn)}</Text>
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View className="flex-row h-[62px]">
            {/* Duration */}
            <View className="flex-1 justify-center px-4 border-r border-border-subtle">
              <Text className="text-text-muted text-[10px] tracking-widest uppercase mb-0.5">
                DURACIÓN
              </Text>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="schedule" size={10} color={COLORS.primary.light} />
                <Text className="text-white text-sm font-semibold">{formatDuration(detail.duracionEnHoras)}</Text>
              </View>
            </View>
            {/* Zone */}
            <View className="flex-1 justify-center px-4">
              <Text className="text-text-muted text-[10px] tracking-widest uppercase mb-0.5">
                ZONA
              </Text>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="place" size={10} color={COLORS.primary.light} />
                <Text className="text-white text-sm font-bold">{detail.cita?.zonaDelCuerpo || detail.cita?.solicitud?.zonaDelCuerpo || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Resultado Final (Photo) ─── */}
        <View className="rounded-2xl p-6 items-center bg-dark-100">
          <Text className="text-text-muted text-sm tracking-[1.4px] uppercase self-start mb-4">
            RESULTADO FINAL
          </Text>
          {detail.fotoResultadoUrl ? (
            <View className="rounded-3xl overflow-hidden w-[157px] h-[103px] bg-dark-100 border border-border-subtle">
              <Image
                source={{ uri: detail.fotoResultadoUrl }}
                style={{ width: 157, height: 103 }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View className="items-center justify-center w-[157px] h-[103px] bg-dark-200 rounded-3xl border border-border-subtle">
              <MaterialIcons name="photo-camera" size={32} color={COLORS.text.dimmed} />
              <Text className="text-text-muted text-[10px] mt-1">Sin foto</Text>
            </View>
          )}
        </View>

        {/* ─── Material Breakdown ─── */}
        {(hasCaps || hasAgujas) && (
          <View className="pt-4">
            {/* Section header */}
            <View className="flex-row items-center justify-between pb-4 border-b border-border-subtle">
              <Text className="text-white text-2xl font-bold tracking-tight">
                Desglose de Materiales
              </Text>
              <MaterialIcons name="inventory-2" size={20} color={COLORS.primary.light} />
            </View>

            {/* Caps de Tinta */}
            {hasCaps && (
              <View className="rounded-2xl p-6 mt-6 bg-dark-100">
                <View className="flex-row items-center mb-4 gap-3">
                  <MaterialIcons name="opacity" size={16} color={COLORS.primary.light} />
                  <Text className="text-white text-base font-semibold">Caps de Tinta</Text>
                </View>

                <View className="gap-3">
                  {detail.capsUsadas.map((cap) => (
                    <View
                      key={cap.id}
                      className="flex-row items-center justify-between p-3 rounded-lg bg-dark-200 border border-border-subtle"
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 12,
                            backgroundColor: cap.tinta.colorHex || COLORS.dark.DEFAULT,
                            borderWidth: 1,
                            borderColor: COLORS.dark[400],
                          }}
                        />
                        <View>
                          <Text className="text-white text-sm font-medium">{cap.tinta.nombre}</Text>
                          <Text className="text-text-muted text-[10px]">{cap.tinta.marca}</Text>
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        <View className="px-2 py-1 rounded bg-dark-100">
                          <Text className="text-text-muted text-xs font-mono">
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
              <View className="rounded-2xl p-6 mt-6 bg-dark-100">
                <View className="flex-row items-center mb-4 gap-3">
                  <MaterialIcons name="push-pin" size={16} color={COLORS.primary.light} />
                  <Text className="text-white text-base font-semibold">Agujas</Text>
                </View>

                <View className="gap-3">
                  {detail.agujasUsadas.map((au) => (
                    <View
                      key={au.id}
                      className="flex-row items-center justify-between p-3 rounded-lg bg-dark-200 border border-border-subtle"
                    >
                      <View>
                        <Text className="text-white text-sm font-semibold">{au.aguja.nombre}</Text>
                        <Text className="text-text-muted text-[10px] tracking-[0.5px] uppercase">
                          {au.aguja.marca} - {au.aguja.tipo}
                        </Text>
                      </View>
                      <View className="px-2 py-1 rounded bg-dark-100">
                        <Text className="text-text-muted text-xs font-mono">
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
