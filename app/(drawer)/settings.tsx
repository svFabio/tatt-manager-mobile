import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Text } from '@/src/components/StyledText';
import { BaseModal } from '@/src/components/BaseModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/src/theme/colors';
import { ConfiguracionAPI, type CitaConflicto } from '@/src/api/configuracion';
import { useStudioStore } from '@/src/store/useStudioStore';


const to12h = (time24: string): string => {
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12.toString().padStart(2, '0')}:${mStr} ${ampm}`;
};


const MIN_HOUR = 7;
const MAX_HOUR = 22;




interface ToastProps { message: string; visible: boolean; type?: 'success' | 'error' | 'warning' }
const Toast = ({ message, visible, type = 'success' }: ToastProps) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.delay(2800),
                Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    const bg = type === 'error' ? COLORS.danger.DEFAULT : type === 'warning' ? COLORS.warning.DEFAULT : COLORS.dark[200];

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 16,
                left: 20,
                right: 20,
                zIndex: 999,
                opacity,
                backgroundColor: bg,
                borderRadius: 12,
                padding: 14,
            }}
        >
            <Text className="text-text-primary text-center font-semibold text-sm">
                {message}
            </Text>
        </Animated.View>
    );
};


interface ConflictModalProps {
    visible: boolean;
    mensaje: string;
    citas: CitaConflicto[];
    onClose: () => void;
}
const ConflictModal = ({ visible, mensaje, citas, onClose }: ConflictModalProps) => (
    <BaseModal visible={visible} onClose={onClose} maxWidth={360} containerStyle={{ borderColor: COLORS.warning.DEFAULT }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <View style={{ backgroundColor: COLORS.warning.ghost, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                        <Feather name="alert-triangle" size={20} color={COLORS.warning.text} />
                    </View>
                    <Text className="text-text-primary font-bold text-base" style={{ flex: 1 }}>
                        Advertencia
                    </Text>
                </View>

                <Text style={{ color: COLORS.text.secondary, fontSize: 13, lineHeight: 18, marginBottom: 16 }}>
                    {mensaje}
                </Text>

                {citas.map(c => {
                    const inicio = new Date(c.inicio);
                    const fin = new Date(c.fin);
                    return (
                        <View
                            key={c.id}
                            style={{
                                backgroundColor: COLORS.dark[200],
                                borderRadius: 10,
                                padding: 12,
                                marginBottom: 8,
                                borderLeftWidth: 3,
                                borderLeftColor: COLORS.warning.DEFAULT,
                            }}
                        >
                            <Text className="text-text-primary font-semibold text-sm">
                                {c.cliente}
                            </Text>
                            <Text style={{ color: COLORS.text.muted, fontSize: 11, marginTop: 2 }}>
                                {inicio.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {'  ·  '}
                                {inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                {' – '}
                                {fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                })}

                <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.8}
                    style={{
                        marginTop: 8,
                        backgroundColor: COLORS.warning.DEFAULT,
                        borderRadius: 12,
                        paddingVertical: 13,
                        alignItems: 'center',
                    }}
                >
                    <Text className="text-text-primary font-bold text-sm">Entendido</Text>
                </TouchableOpacity>
    </BaseModal>
);


// ─── Hour Picker Modal ────────────────────────────────────────────────────────

const HOURS_AM = Array.from({ length: 6 }, (_, i) => i + 7);  // 7–12
const HOURS_PM = Array.from({ length: 10 }, (_, i) => i + 13); // 13–22

interface HourPickerModalProps {
    visible: boolean;
    label: string;
    value: string;
    onConfirm: (time: string) => void;
    onClose: () => void;
}
const HourPickerModal = ({ visible, label, value, onConfirm, onClose }: HourPickerModalProps) => {
    const currentH = parseInt(value.split(':')[0], 10);
    const [selected, setSelected] = useState(currentH);

    useEffect(() => {
        if (visible) setSelected(parseInt(value.split(':')[0], 10));
    }, [visible, value]);

    const toLabel = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return { h12, ampm };
    };

    const renderHour = (h: number) => {
        const active = selected === h;
        const { h12, ampm } = toLabel(h);
        return (
            <TouchableOpacity
                key={h}
                onPress={() => setSelected(h)}
                activeOpacity={0.7}
                style={{
                    width: '30%',
                    margin: '1.5%',
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: active ? COLORS.primary.DEFAULT : COLORS.dark[200],
                    borderWidth: active ? 0 : 1,
                    borderColor: COLORS.border.subtle,
                }}
            >
                <Text className="text-text-primary font-bold text-lg">
                    {h12.toString().padStart(2, '0')}
                </Text>
                <Text style={{ color: active ? 'rgba(255,255,255,0.7)' : COLORS.text.muted, fontSize: 10, marginTop: 2 }}>
                    {ampm}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} activeOpacity={1} onPress={onClose} />
                <View
                    style={{
                        backgroundColor: COLORS.dark[100],
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: 32,
                    }}
                >
                    {/* Handle */}
                    <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.dark[300], alignSelf: 'center', marginBottom: 20 }} />

                    <Text style={{ color: COLORS.text.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        Seleccionar hora
                    </Text>
                    <Text className="text-text-primary font-bold text-lg mb-20">
                        {label}
                    </Text>

                    {/* AM */}
                    <Text style={{ color: COLORS.text.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                        AM
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                        {HOURS_AM.map(renderHour)}
                    </View>

                    {/* PM */}
                    <Text style={{ color: COLORS.text.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                        PM
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
                        {HOURS_PM.map(renderHour)}
                    </View>

                    {/* Confirm */}
                    <TouchableOpacity
                        onPress={() => {
                            onConfirm(`${selected.toString().padStart(2, '0')}:00`);
                            onClose();
                        }}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: COLORS.primary.DEFAULT,
                            borderRadius: 14,
                            paddingVertical: 15,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                        }}
                    >
                        <Feather name="check" size={17} color={COLORS.text.primary} />
                        <Text style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: 15 }}>
                            Confirmar · {toLabel(selected).h12.toString().padStart(2, '0')}:00 {toLabel(selected).ampm}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function SettingsScreen() {
    const currentStudio = useStudioStore(s => s.currentStudio);
    const isAdmin = currentStudio?.rol === 'ADMIN';

    const [nombre, setNombre] = useState(currentStudio?.nombre ?? '');
    const [editingNombre, setEditingNombre] = useState(false);

    const [apertura, setApertura] = useState('09:00');
    const [cierre, setCierre] = useState('21:00');
    const [showAperturaPicker, setShowAperturaPicker] = useState(false);
    const [showCierrePicker, setShowCierrePicker] = useState(false);

    const [qrUri, setQrUri] = useState<string | null>(null);

    const [saving, setSaving] = useState(false);
    const [savingQR, setSavingQR] = useState(false);
    const [deletingQR, setDeletingQR] = useState(false);

    const [toastMsg, setToastMsg] = useState('');
    const [toastVisible, setToastVisible] = useState(false);
    const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');

    const [conflictVisible, setConflictVisible] = useState(false);
    const [conflictMensaje, setConflictMensaje] = useState('');
    const [conflictCitas, setConflictCitas] = useState<CitaConflicto[]>([]);

    const showToast = useCallback((msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setToastMsg(msg);
        setToastType(type);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3200);
    }, []);


    const handleGuardar = async () => {
        if (nombre.trim().length < 2) {
            showToast('El nombre debe tener al menos 2 caracteres.', 'error');
            return;
        }
        const hApertura = parseInt(apertura.split(':')[0], 10);
        const hCierre = parseInt(cierre.split(':')[0], 10);
        if (hApertura < MIN_HOUR || hApertura > MAX_HOUR) {
            showToast(`La apertura debe estar entre ${MIN_HOUR}:00 y ${MAX_HOUR}:00.`, 'error');
            return;
        }
        if (hCierre < MIN_HOUR || hCierre > MAX_HOUR) {
            showToast(`El cierre debe estar entre ${MIN_HOUR}:00 y ${MAX_HOUR}:00.`, 'error');
            return;
        }
        if (hApertura >= hCierre) {
            showToast('La apertura debe ser menor que el cierre.', 'error');
            return;
        }
        setSaving(true);
        try {
            await ConfiguracionAPI.actualizarNombreEstudio(nombre.trim());
            const res = await ConfiguracionAPI.actualizarHorario({ horaApertura: apertura, horaCierre: cierre });
            if (res.advertencia) {
                setConflictMensaje(res.advertencia.mensaje);
                setConflictCitas(res.advertencia.citas);
                setConflictVisible(true);
            } else {
                showToast('Cambios guardados correctamente.');
            }
            setEditingNombre(false);
        } catch (e: any) {
            const msg = e?.response?.data?.error ?? 'No se pudieron guardar los cambios.';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };


    const handlePickQR = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showToast('Se necesita permiso para acceder a la galería.', 'error');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images' as any,
            allowsEditing: true,
            quality: 0.8,
        });
        if (result.canceled) return;
        const imagen = result.assets[0];
        setSavingQR(true);
        try {
            await ConfiguracionAPI.subirQR({ uri: imagen.uri, mimeType: imagen.mimeType });
            setQrUri(imagen.uri);
            showToast('QR actualizado correctamente.');
        } catch {
            showToast('No se pudo subir el QR.', 'error');
        } finally {
            setSavingQR(false);
        }
    };

    const handleEliminarQR = () => {
        Alert.alert(
            'Eliminar QR',
            '¿Estás seguro de que deseas eliminar la imagen del QR?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingQR(true);
                        try {
                            await ConfiguracionAPI.eliminarQR();
                            setQrUri(null);
                            showToast('QR eliminado.');
                        } catch (e: any) {
                            const msg = e?.response?.data?.error ?? 'No se pudo eliminar el QR.';
                            showToast(msg, 'error');
                        } finally {
                            setDeletingQR(false);
                        }
                    },
                },
            ]
        );
    };

    if (!isAdmin) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }} edges={['bottom']}>
                <MaterialIcons name="lock-outline" size={48} color={COLORS.text.dimmed} />
                <Text style={{ color: COLORS.text.secondary, marginTop: 16, fontSize: 16, textAlign: 'center' }}>
                    Solo los administradores pueden acceder a esta sección.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
            <Toast message={toastMsg} visible={toastVisible} type={toastType} />

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={{
                        backgroundColor: COLORS.dark.DEFAULT,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: COLORS.border.subtle,
                        padding: 20,
                        marginBottom: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 16,
                    }}
                >
                    <View
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            backgroundColor: COLORS.primary.ghost,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Feather name="settings" size={24} color={COLORS.primary.light} />
                    </View>
                    <View>
                        <Text className="text-text-primary font-bold text-xl">
                            Configurar Estudio
                        </Text>
                        <Text style={{ color: COLORS.text.muted, fontSize: 12, marginTop: 2 }}>
                            Edita el nombre y el horario de atención.
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: COLORS.dark.DEFAULT,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: COLORS.border.subtle,
                        padding: 16,
                        marginBottom: 16,
                    }}
                >
                    <Text style={{ color: COLORS.text.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                        Nombre del Estudio
                    </Text>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderBottomWidth: 1,
                            borderBottomColor: editingNombre ? COLORS.primary.DEFAULT : COLORS.border.subtle,
                            paddingBottom: 8,
                        }}
                    >
                        <TextInput
                            value={nombre}
                            onChangeText={setNombre}
                            onFocus={() => setEditingNombre(true)}
                            onBlur={() => setEditingNombre(false)}
                            style={{
                                flex: 1,
                                color: COLORS.text.primary,
                                fontSize: 16,
                                fontWeight: '600',
                            }}
                            placeholderTextColor={COLORS.text.dimmed}
                            placeholder="Nombre del estudio"
                        />
                        <Feather name="edit-2" size={16} color={COLORS.text.muted} style={{ marginLeft: 8 }} />
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: COLORS.dark.DEFAULT,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: COLORS.border.subtle,
                        padding: 16,
                        marginBottom: 16,
                    }}
                >
                    <Text style={{ color: COLORS.text.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                        Horario de Atención
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => setShowAperturaPicker(true)}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.dark[100],
                                borderRadius: 12,
                                padding: 14,
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Feather name="clock" size={12} color={COLORS.text.muted} />
                                <Text style={{ color: COLORS.text.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                    Apertura
                                </Text>
                            </View>
                            <Text style={{ color: COLORS.text.primary, fontSize: 20, fontWeight: '700' }}>
                                {to12h(apertura)}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ justifyContent: 'center' }}>
                            <Text style={{ color: COLORS.text.dimmed, fontSize: 18 }}>—</Text>
                        </View>

                        {/* Cierre */}
                        <TouchableOpacity
                            onPress={() => setShowCierrePicker(true)}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.dark[100],
                                borderRadius: 12,
                                padding: 14,
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Feather name="clock" size={12} color={COLORS.text.muted} />
                                <Text style={{ color: COLORS.text.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                    Cierre
                                </Text>
                            </View>
                            <Text style={{ color: COLORS.text.primary, fontSize: 20, fontWeight: '700' }}>
                                {to12h(cierre)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <HourPickerModal
                        visible={showAperturaPicker}
                        label="Hora de Apertura"
                        value={apertura}
                        onConfirm={setApertura}
                        onClose={() => setShowAperturaPicker(false)}
                    />
                    <HourPickerModal
                        visible={showCierrePicker}
                        label="Hora de Cierre"
                        value={cierre}
                        onConfirm={setCierre}
                        onClose={() => setShowCierrePicker(false)}
                    />

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }}>
                        <Feather name="info" size={12} color={COLORS.text.dimmed} />
                        <Text style={{ color: COLORS.text.dimmed, fontSize: 11 }}>
                            El rango permitido es de 07:00 a 22:00, solo horas enteras.
                        </Text>
                    </View>
                </View>

                {/* ── QR de Pago ───────────────────────────────────────────── */}
                <View
                    style={{
                        backgroundColor: COLORS.dark.DEFAULT,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: COLORS.border.subtle,
                        padding: 16,
                        marginBottom: 28,
                    }}
                >
                    <Text style={{ color: COLORS.text.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                        Código QR de Pago
                    </Text>

                    {qrUri ? (
                        <View style={{ alignItems: 'center', marginBottom: 16 }}>
                            <Image
                                source={{ uri: qrUri }}
                                style={{
                                    width: 160,
                                    height: 160,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: COLORS.border.subtle,
                                }}
                                resizeMode="contain"
                            />
                        </View>
                    ) : (
                        <View
                            style={{
                                height: 120,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: COLORS.border.subtle,
                                borderStyle: 'dashed',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                                gap: 8,
                            }}
                        >
                            <MaterialIcons name="qr-code" size={36} color={COLORS.text.dimmed} />
                            <Text style={{ color: COLORS.text.dimmed, fontSize: 12 }}>Sin imagen QR</Text>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            onPress={handlePickQR}
                            disabled={savingQR}
                            activeOpacity={0.8}
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.primary.ghost,
                                borderWidth: 1,
                                borderColor: COLORS.primary.border,
                                borderRadius: 12,
                                paddingVertical: 12,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 6,
                            }}
                        >
                            {savingQR ? (
                                <ActivityIndicator size="small" color={COLORS.primary.light} />
                            ) : (
                                <Feather name="upload" size={15} color={COLORS.primary.light} />
                            )}
                            <Text style={{ color: COLORS.primary.light, fontWeight: '700', fontSize: 13 }}>
                                {qrUri ? 'Reemplazar' : 'Subir QR'}
                            </Text>
                        </TouchableOpacity>

                        {qrUri && (
                            <TouchableOpacity
                                onPress={handleEliminarQR}
                                disabled={deletingQR}
                                activeOpacity={0.8}
                                style={{
                                    backgroundColor: COLORS.danger.ghost,
                                    borderWidth: 1,
                                    borderColor: COLORS.danger.border,
                                    borderRadius: 12,
                                    paddingHorizontal: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {deletingQR ? (
                                    <ActivityIndicator size="small" color={COLORS.danger.text} />
                                ) : (
                                    <Feather name="trash-2" size={16} color={COLORS.danger.text} />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ── Guardar ──────────────────────────────────────────────── */}
                <TouchableOpacity
                    onPress={handleGuardar}
                    disabled={saving}
                    activeOpacity={0.85}
                    style={{
                        backgroundColor: COLORS.primary.DEFAULT,
                        borderRadius: 16,
                        paddingVertical: 16,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 10,
                    }}
                >
                    {saving ? (
                        <ActivityIndicator color={COLORS.text.primary} />
                    ) : (
                        <>
                            <Text className="text-text-primary font-bold text-base">
                                Guardar Cambios
                            </Text>
                            <Feather name="check" size={18} color={COLORS.text.primary} />
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            <ConflictModal
                visible={conflictVisible}
                mensaje={conflictMensaje}
                citas={conflictCitas}
                onClose={() => setConflictVisible(false)}
            />
        </SafeAreaView>
    );
}
