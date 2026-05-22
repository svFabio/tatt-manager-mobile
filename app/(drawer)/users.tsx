import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Share,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/src/theme/colors';
import { UsersAPI } from '@/src/api/users';
import { useAuthStore } from '@/src/store/useAuthStore';
import type { RolUsuario, Usuario } from '@/src/types/usuarios';

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#4338CA', '#7C3AED', '#B45309', '#047857', '#1D4ED8', '#BE185D'];

const getInitials = (nombre: string) =>
    nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

const getAvatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const getCurrentUserId = (token: string | null): number | null => {
    if (!token) return null;
    try {
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(b64)).id as number;
    } catch {
        return null;
    }
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface RolBadgeProps { rol: RolUsuario }
const RolBadge = ({ rol }: RolBadgeProps) => {
    const isAdmin = rol === 'ADMIN';
    return (
        <View
            style={{
                backgroundColor: isAdmin ? COLORS.primary.ghost : 'rgba(124, 58, 237, 0.15)',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 2,
            }}
        >
            <Text style={{ color: isAdmin ? COLORS.primary.light : '#A78BFA', fontSize: 11, fontWeight: '700' }}>
                {isAdmin ? 'Admin' : 'Artista'}
            </Text>
        </View>
    );
};

interface UserRowProps {
    item: Usuario;
    isMe: boolean;
    onMenuPress: (u: Usuario) => void;
}
const UserRow = ({ item, isMe, onMenuPress }: UserRowProps) => (
    <View
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 4,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border.subtle,
        }}
    >
        {/* Avatar */}
        <View
            style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: getAvatarColor(item.id),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
            }}
        >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                {getInitials(item.nombre)}
            </Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Text style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: 14 }}>
                    {item.nombre}
                </Text>
                <RolBadge rol={item.rol} />
            </View>
            <Text style={{ color: COLORS.text.muted, fontSize: 12 }}>{item.email}</Text>
        </View>

        {/* Three-dot menu — hidden for current user */}
        {!isMe && (
            <TouchableOpacity
                onPress={() => onMenuPress(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
            >
                <Feather name="more-vertical" size={20} color={COLORS.text.muted} />
            </TouchableOpacity>
        )}
    </View>
);

// ─── Toast ───────────────────────────────────────────────────────────────────

interface ToastProps { message: string; visible: boolean }
const Toast = ({ message, visible }: ToastProps) => {
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
    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 16,
                left: 20,
                right: 20,
                zIndex: 999,
                opacity,
                backgroundColor: COLORS.danger.DEFAULT,
                borderRadius: 12,
                padding: 14,
            }}
        >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 13 }}>
                {message}
            </Text>
        </Animated.View>
    );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function UsersScreen() {
    const token = useAuthStore(s => s.token);
    const currentUserId = getCurrentUserId(token);

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [invCode, setInvCode] = useState<string | null>(null);
    const [loadingCode, setLoadingCode] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [changingRol, setChangingRol] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const [toastMsg, setToastMsg] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3200);
    };

    // ── Data loading ──────────────────────────────────────────────────────────

    const loadUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            const data = await UsersAPI.getAll();
            setUsuarios(data);
        } catch {
            showToast('No se pudo cargar la lista de usuarios.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadInvitationCode = useCallback(async () => {
        try {
            setLoadingCode(true);
            const codigo = await UsersAPI.getInvitationCode();
            setInvCode(codigo);
        } catch {
            setInvCode(null);
        } finally {
            setLoadingCode(false);
        }
    }, []);

    useEffect(() => {
        loadUsuarios();
        loadInvitationCode();
    }, [loadUsuarios, loadInvitationCode]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleCopyCode = async () => {
        if (!invCode) return;
        try {
            await Share.share({ message: invCode });
        } catch { /* user cancelled */ }
    };

    const handleRegenerate = async () => {
        try {
            setRegenerating(true);
            const nuevo = await UsersAPI.regenerateCode();
            setInvCode(nuevo);
        } catch {
            showToast('No se pudo regenerar el código. Inténtalo de nuevo.');
        } finally {
            setRegenerating(false);
        }
    };

    const openMenu = (usuario: Usuario) => {
        setSelectedUser(usuario);
        setShowMenu(true);
    };

    const closeMenu = () => {
        setShowMenu(false);
        setSelectedUser(null);
    };

    const handleCambiarRol = async () => {
        if (!selectedUser) return;
        const nuevoRol: RolUsuario = selectedUser.rol === 'ARTISTA' ? 'ADMIN' : 'ARTISTA';
        setChangingRol(true);
        try {
            const actualizado = await UsersAPI.updateRol(selectedUser.id, nuevoRol);
            setUsuarios(prev => prev.map(u => u.id === actualizado.id ? actualizado : u));
            closeMenu();
        } catch {
            showToast('No se pudo cambiar el rol. Inténtalo de nuevo.');
        } finally {
            setChangingRol(false);
        }
    };

    const handleRevocarAcceso = () => {
        if (!selectedUser) return;
        closeMenu();
        Alert.alert(
            'Revocar acceso',
            `¿Estás seguro de que deseas revocar el acceso de ${selectedUser.nombre}? El usuario ya no podrá ingresar al panel de este local, pero su historial de citas, clientes y transacciones pasadas se conservará en los registros del estudio.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Revocar',
                    style: 'destructive',
                    onPress: async () => {
                        if (!selectedUser) return;
                        setRevoking(true);
                        try {
                            await UsersAPI.revocarAcceso(selectedUser.id);
                            setUsuarios(prev => prev.filter(u => u.id !== selectedUser.id));
                        } catch {
                            showToast('No se pudo revocar el acceso. Inténtalo de nuevo.');
                        } finally {
                            setRevoking(false);
                        }
                    },
                },
            ],
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const renderHeader = () => (
        <View>
            {/* Invitation Code Card */}
            <View
                style={{
                    backgroundColor: COLORS.dark.DEFAULT,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: COLORS.border.subtle,
                    padding: 20,
                    marginBottom: 28,
                }}
            >
                <Text style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: 16, marginBottom: 4 }}>
                    Código de Invitación del Estudio
                </Text>
                <Text style={{ color: COLORS.text.muted, fontSize: 12, marginBottom: 16 }}>
                    Usa este código para invitar a nuevos artistas
                </Text>

                {/* Code display */}
                <View
                    style={{
                        backgroundColor: COLORS.dark[100],
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16,
                        alignItems: 'center',
                    }}
                >
                    {loadingCode ? (
                        <ActivityIndicator color={COLORS.primary.DEFAULT} />
                    ) : (
                        <Text
                            style={{
                                color: COLORS.text.primary,
                                fontSize: 18,
                                fontWeight: '700',
                                letterSpacing: 2,
                                textAlign: 'center',
                            }}
                        >
                            {invCode ?? '— — — — — — —'}
                        </Text>
                    )}
                </View>

                {/* Buttons */}
                <TouchableOpacity
                    onPress={handleCopyCode}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: COLORS.primary.DEFAULT,
                        borderRadius: 12,
                        paddingVertical: 13,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8,
                        marginBottom: 10,
                    }}
                >
                    <Feather name="copy" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Copiar Código</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleRegenerate}
                    disabled={regenerating}
                    activeOpacity={0.8}
                    style={{
                        borderWidth: 1,
                        borderColor: COLORS.primary.DEFAULT,
                        borderRadius: 12,
                        paddingVertical: 13,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 8,
                    }}
                >
                    {regenerating
                        ? <ActivityIndicator size="small" color={COLORS.primary.DEFAULT} />
                        : <Feather name="refresh-cw" size={16} color={COLORS.primary.DEFAULT} />
                    }
                    <Text style={{ color: COLORS.primary.DEFAULT, fontWeight: '700', fontSize: 14 }}>
                        Regenerar
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List header */}
            <Text style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: 18, marginBottom: 2 }}>
                Usuarios
            </Text>
            <Text style={{ color: COLORS.text.muted, fontSize: 13, marginBottom: 12 }}>
                Gestiona los usuarios del sistema
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['bottom']}>
            <Toast message={toastMsg} visible={toastVisible} />

            {loading ? (
                <ActivityIndicator color={COLORS.primary.DEFAULT} size="large" style={{ marginTop: 60 }} />
            ) : (
                <FlatList
                    data={usuarios}
                    keyExtractor={u => u.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <UserRow
                            item={item}
                            isMe={item.id === currentUserId}
                            onMenuPress={openMenu}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <MaterialIcons name="group-off" size={48} color={COLORS.text.dimmed} />
                            <Text style={{ color: COLORS.text.secondary, marginTop: 12, fontSize: 15 }}>
                                No hay usuarios en el estudio
                            </Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Context bottom sheet */}
            <Modal
                visible={showMenu}
                transparent
                animationType="slide"
                onRequestClose={closeMenu}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}
                        activeOpacity={1}
                        onPress={closeMenu}
                    />
                    <View
                        style={{
                            backgroundColor: COLORS.dark[100],
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingHorizontal: 20,
                            paddingTop: 12,
                            paddingBottom: 32,
                        }}
                    >
                        {/* Handle */}
                        <View
                            style={{
                                width: 36,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: COLORS.dark[300],
                                alignSelf: 'center',
                                marginBottom: 20,
                            }}
                        />

                        {/* Header */}
                        <Text style={{ color: COLORS.text.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>
                            Opciones de Usuario
                        </Text>
                        <Text style={{ color: COLORS.text.primary, fontWeight: '700', fontSize: 18, marginBottom: 20 }}>
                            {selectedUser?.nombre}
                        </Text>

                        <View style={{ height: 1, backgroundColor: COLORS.border.subtle, marginBottom: 4 }} />

                        {/* Cambiar Rol */}
                        <TouchableOpacity
                            onPress={handleCambiarRol}
                            disabled={changingRol}
                            activeOpacity={0.7}
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 }}
                        >
                            {changingRol
                                ? <ActivityIndicator size="small" color={COLORS.primary.light} />
                                : <MaterialIcons name="swap-horiz" size={22} color={COLORS.primary.light} />
                            }
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: COLORS.text.primary, fontWeight: '600', fontSize: 15 }}>
                                    Cambiar Rol
                                </Text>
                                <Text style={{ color: COLORS.text.muted, fontSize: 12, marginTop: 1 }}>
                                    {selectedUser?.rol === 'ARTISTA' ? 'Convertir en Admin' : 'Convertir en Artista'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <View style={{ height: 1, backgroundColor: COLORS.border.subtle }} />

                        {/* Revocar acceso */}
                        <TouchableOpacity
                            onPress={handleRevocarAcceso}
                            disabled={revoking}
                            activeOpacity={0.7}
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 }}
                        >
                            {revoking
                                ? <ActivityIndicator size="small" color={COLORS.danger.text} />
                                : <MaterialIcons name="delete-outline" size={22} color={COLORS.danger.text} />
                            }
                            <Text style={{ color: COLORS.danger.text, fontWeight: '600', fontSize: 15 }}>
                                Revocar Acceso al Estudio
                            </Text>
                        </TouchableOpacity>

                        <View style={{ height: 1, backgroundColor: COLORS.border.subtle, marginBottom: 4 }} />

                        {/* Cancelar */}
                        <TouchableOpacity
                            onPress={closeMenu}
                            activeOpacity={0.7}
                            style={{
                                marginTop: 12,
                                paddingVertical: 14,
                                borderRadius: 14,
                                backgroundColor: COLORS.dark[200],
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: COLORS.text.secondary, fontWeight: '700', fontSize: 15 }}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
