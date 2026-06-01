import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, FlatList, TouchableOpacity, Image, Modal,
  ActivityIndicator, Animated, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/StyledText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePagosStore } from '@/src/store/usePagosStore';
import { socket } from '@/src/api/socket';
import { COLORS } from '@/src/theme/colors';
import type { PagoComprobante } from '@/src/api/pagos';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Toast flotante ──────────────────────────────────────────────────────────
function Toast({ message, onHide }: { message: string; onHide: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onHide);
  }, []);

  return (
    <Animated.View style={[s.toast, { opacity }]}>
      <MaterialIcons name="error-outline" size={16} color="#fff" />
      <Text style={s.toastText}>{message}</Text>
    </Animated.View>
  );
}

// ─── Tarjeta de comprobante ──────────────────────────────────────────────────
function ComprobanteCard({
  item,
  onConfirmar,
  onRechazar,
  onImagePress,
}: {
  item: PagoComprobante;
  onConfirmar: () => void;
  onRechazar: () => void;
  onImagePress: () => void;
}) {
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingReject, setLoadingReject]   = useState(false);

  const fecha = item.cita?.fechaHoraInicio
    ? new Date(item.cita.fechaHoraInicio).toLocaleDateString('es', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null;

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.clientName}>{item.cliente.nombre}</Text>
          {fecha && (
            <Text style={s.citaDate}>
              <MaterialIcons name="event" size={11} color={COLORS.text.muted} /> Cita: {fecha}
            </Text>
          )}
        </View>
        <View style={s.montoBadge}>
          <Text style={s.montoText}>${Number(item.monto).toFixed(2)}</Text>
        </View>
      </View>

      {/* Imagen */}
      <TouchableOpacity activeOpacity={0.85} style={s.imageContainer} onPress={onImagePress}>
        {item.fotoComprobanteUrl ? (
          <>
            <Image source={{ uri: item.fotoComprobanteUrl }} style={s.thumbnail} resizeMode="cover" />
            <View style={s.imageOverlay}>
              <MaterialIcons name="zoom-in" size={22} color="rgba(255,255,255,0.9)" />
            </View>
          </>
        ) : (
          <View style={s.noImage}>
            <MaterialIcons name="image-not-supported" size={32} color={COLORS.text.muted} />
            <Text style={s.noImageText}>Sin comprobante</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Acciones */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.btn, s.btnReject]}
          activeOpacity={0.8}
          disabled={loadingConfirm || loadingReject}
          onPress={async () => {
            setLoadingReject(true);
            try { await onRechazar(); } finally { setLoadingReject(false); }
          }}
        >
          {loadingReject
            ? <ActivityIndicator size="small" color="#fff" />
            : <><MaterialIcons name="close" size={18} color="#fff" /><Text style={s.btnText}>Rechazar</Text></>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, s.btnConfirm]}
          activeOpacity={0.8}
          disabled={loadingConfirm || loadingReject}
          onPress={async () => {
            setLoadingConfirm(true);
            try { await onConfirmar(); } finally { setLoadingConfirm(false); }
          }}
        >
          {loadingConfirm
            ? <ActivityIndicator size="small" color="#fff" />
            : <><MaterialIcons name="check" size={18} color="#fff" /><Text style={s.btnText}>Confirmar</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Pantalla principal ──────────────────────────────────────────────────────
export default function ValidarPagosScreen() {
  const { pendientes, isLoading, error, fetchPendientes, confirmarPago, rechazarPago } = usePagosStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toastMsg, setToastMsg]           = useState<string | null>(null);

  const showToast = (msg: string) => setToastMsg(msg);

  const load = useCallback(() => { fetchPendientes(); }, [fetchPendientes]);

  useEffect(() => { load(); }, [load]);

  // Socket: nuevo comprobante → recargar
  useEffect(() => {
    socket.on('nuevo-comprobante-pago', load);
    return () => { socket.off('nuevo-comprobante-pago', load); };
  }, [load]);

  // Mostrar error del store como toast
  useEffect(() => {
    if (error) showToast(error);
  }, [error]);

  const handleConfirmar = async (id: number) => {
    try {
      await confirmarPago(id);
    } catch {
      showToast('No se pudo procesar la acción. Inténtalo de nuevo.');
    }
  };

  const handleRechazar = async (id: number) => {
    try {
      await rechazarPago(id);
    } catch {
      showToast('No se pudo procesar la acción. Inténtalo de nuevo.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.title}>Validación de Comprobantes</Text>
        <Text style={s.subtitle}>Revisa las fotos enviadas por WhatsApp</Text>
        <View style={[s.badge, pendientes.length > 0 ? s.badgeActive : s.badgeEmpty]}>
          <MaterialIcons
            name={pendientes.length > 0 ? 'hourglass-top' : 'check-circle'}
            size={13}
            color={pendientes.length > 0 ? COLORS.warning.text : COLORS.success.DEFAULT}
          />
          <Text style={[s.badgeText, { color: pendientes.length > 0 ? COLORS.warning.text : COLORS.success.DEFAULT }]}>
            {isLoading ? '…' : `${pendientes.length} pendiente${pendientes.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* ── Contenido ── */}
      {isLoading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        </View>
      ) : pendientes.length === 0 ? (
        <View style={s.centered}>
          <View style={s.emptyIcon}>
            <MaterialIcons name="check-circle-outline" size={52} color={COLORS.success.DEFAULT} />
          </View>
          <Text style={s.emptyTitle}>¡Todo al día!</Text>
          <Text style={s.emptySubtitle}>No hay pagos pendientes de revisión.</Text>
        </View>
      ) : (
        <FlatList
          data={pendientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ComprobanteCard
              item={item}
              onImagePress={() => setSelectedImage(item.fotoComprobanteUrl)}
              onConfirmar={() => handleConfirmar(item.id)}
              onRechazar={() => handleRechazar(item.id)}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={load}
        />
      )}

      {/* ── Lightbox ── */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={s.lightbox}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setSelectedImage(null)} />
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={s.fullImage} resizeMode="contain" />
          )}
          <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedImage(null)}>
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Toast de error ── */}
      {toastMsg && (
        <Toast message={toastMsg} onHide={() => setToastMsg(null)} />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: COLORS.warning.ghost,
    borderColor: COLORS.warning.DEFAULT,
  },
  badgeEmpty: {
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderColor: 'rgba(76,175,80,0.3)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Centered states
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(76,175,80,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.muted,
    marginTop: 6,
    textAlign: 'center',
  },
  // Card
  card: {
    backgroundColor: COLORS.dark[100],
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  citaDate: {
    fontSize: 12,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  montoBadge: {
    backgroundColor: COLORS.primary.ghost,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  montoText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary.DEFAULT,
  },
  // Image
  imageContainer: {
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.dark[200],
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'flex-end',
    padding: 8,
  },
  noImage: {
    alignItems: 'center',
    gap: 6,
  },
  noImageText: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  // Buttons
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  btnConfirm: {
    backgroundColor: '#22c55e',
  },
  btnReject: {
    backgroundColor: COLORS.danger.DEFAULT,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // Lightbox
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SW * 0.95,
    height: SH * 0.75,
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 8,
  },
  // Toast
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: COLORS.danger.DEFAULT,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
