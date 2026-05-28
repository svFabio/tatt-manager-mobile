import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { Text, TextInput } from '@/src/components/StyledText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { InventarioAPI } from '../../../api/inventario';
import type { InventarioItem } from '../../../types/inventario';
import { COLORS } from '../../../theme/colors';
import type { AxiosError } from 'axios';

const axiosMsg = (error: unknown, fallback: string): string => {
    const e = error as AxiosError<{ error?: string }>;
    return e?.response?.data?.error ?? fallback;
};

export default function EditarInsumoScreen() {
    const router = useRouter();
    const { item: itemParam } = useLocalSearchParams();
    
    // Parse the item from params
    let item: InventarioItem | null = null;
    try {
        if (itemParam && typeof itemParam === 'string') {
            item = JSON.parse(itemParam);
        }
    } catch (e) {
        console.error("Error parsing item", e);
    }

    // Default values if item is null (shouldn't happen)
    const [nombre, setNombre] = useState(item?.nombre ?? '');
    const [marca, setMarca] = useState(item?.marca ?? '');
    const [cantidadMinima, setCantidadMinima] = useState(item?.cantidadMinima?.toString() ?? '3');
    
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!item) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: COLORS.dark.DEFAULT }}>
                <Text className="text-white">Error cargando el ítem.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 p-2 bg-dark-100 rounded">
                    <Text className="text-white">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const showMessage = (title: string, message: string, onOk?: () => void) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}: ${message}`);
            if (onOk) onOk();
        } else {
            Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
        }
    };

    const handleSave = async () => {
        if (!nombre.trim() || !marca.trim() || !cantidadMinima.trim()) {
            showMessage('Error', 'Todos los campos son obligatorios.');
            return;
        }

        if (!/^\d+$/.test(cantidadMinima.trim())) {
            showMessage('Error', 'El stock mínimo debe ser un número entero válido (ej. 3).');
            return;
        }
        
        const cantMin = parseInt(cantidadMinima.trim(), 10);

        setLoading(true);
        try {
            const res = await InventarioAPI.editarInsumo({
                tipo: item!.tipo,
                refId: item!.refId,
                nombre: nombre.trim(),
                marca: marca.trim(),
                cantidadMinima: cantMin
            });

            if (res.ok) {
                showMessage('Éxito', 'Ítem actualizado correctamente.', () => router.back());
            } else {
                showMessage('Error', (res as any).error || 'Error al actualizar el ítem');
            }
        } catch (error: unknown) {
            showMessage('Error', axiosMsg(error, 'Ocurrió un error al guardar'));
        } finally {
            setLoading(false);
        }
    };

    const executeDelete = async () => {
        setDeleting(true);
        setShowDeleteModal(false);
        try {
            const res = await InventarioAPI.eliminarInsumo({
                tipo: item!.tipo,
                refId: item!.refId
            });
            if (res.ok) {
                showMessage('Eliminado', 'El ítem fue eliminado del catálogo.', () => router.back());
            } else {
                showMessage('Error', (res as any).error || 'No se pudo eliminar el ítem');
            }
        } catch (error: unknown) {
            showMessage('Error', axiosMsg(error, 'Error de conexión'));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
            style={{ backgroundColor: COLORS.dark.DEFAULT }}
        >
            <View className="flex-row items-center px-4 py-4 border-b border-white/5">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.primary.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Editar ítem</Text>
            </View>

            <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
                <Text className="text-sm mb-6" style={{ color: COLORS.text.secondary }}>
                    Actualiza los detalles de este ítem del inventario.
                </Text>

                <View className="bg-dark-100 rounded-xl p-4 mb-4 border border-white/5">
                    <Text className="text-primary-light text-xs font-bold tracking-widest mb-2">NOMBRE DEL ÍTEM</Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholderTextColor={COLORS.text.muted}
                        className="text-white text-base py-2 border-b border-white/10"
                    />
                </View>

                <View className="bg-dark-100 rounded-xl p-4 mb-4 border border-white/5">
                    <Text className="text-primary-light text-xs font-bold tracking-widest mb-2">MARCA</Text>
                    <TextInput
                        value={marca}
                        onChangeText={setMarca}
                        placeholderTextColor={COLORS.text.muted}
                        className="text-white text-base py-2 border-b border-white/10"
                    />
                </View>

                <View className="bg-dark-100 rounded-xl p-4 mb-8 border border-white/5">
                    <Text className="text-primary-light text-xs font-bold tracking-widest mb-2">STOCK MÍNIMO</Text>
                    <View className="flex-row items-center border-b border-white/10 py-2">
                        <TextInput
                            value={cantidadMinima}
                            onChangeText={setCantidadMinima}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.text.muted}
                            className="flex-1 text-white text-base"
                        />
                        <Text className="text-sm ml-2" style={{ color: COLORS.text.muted }}>{item.unidad}</Text>
                    </View>
                    <Text className="text-xs mt-2" style={{ color: COLORS.text.muted }}>
                        Se activará una alerta cuando el stock baje de este número.
                    </Text>
                </View>

                <TouchableOpacity 
                    className="bg-gold rounded-lg py-4 items-center mb-4 flex-row justify-center"
                    onPress={handleSave}
                    disabled={loading || deleting}
                >
                    <Text className="text-dark font-bold text-base">Guardar Cambios</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    className="border rounded-lg py-4 items-center flex-row justify-center"
                    style={{ borderColor: COLORS.danger.DEFAULT }}
                    onPress={() => setShowDeleteModal(true)}
                    disabled={loading || deleting}
                >
                    <MaterialIcons name="delete-outline" size={20} color={COLORS.danger.DEFAULT} className="mr-2" />
                    <Text className="font-bold text-base" style={{ color: COLORS.danger.text }}>Eliminar ítem</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Custom Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View className="flex-1 bg-black/70 justify-center items-center px-4">
                    <View className="bg-dark-100 w-full max-w-sm rounded-2xl p-6 border border-white/10">
                        <View className="items-center mb-4">
                            <View className="p-3 rounded-full mb-3" style={{ backgroundColor: COLORS.danger.ghost }}>
                                <MaterialIcons name="warning" size={32} color={COLORS.danger.DEFAULT} />
                            </View>
                            <Text className="text-white text-xl font-bold text-center">Eliminar ítem</Text>
                        </View>
                        
                        <Text className="text-center mb-6" style={{ color: COLORS.text.secondary }}>
                            ¿Estás seguro de que deseas eliminar este ítem del inventario? Esta acción no se puede deshacer y desaparecerá del catálogo.
                        </Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity 
                                className="flex-1 bg-dark-200 py-3 rounded-lg items-center mr-2 border border-white/5"
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text className="text-white font-semibold">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 py-3 rounded-lg items-center ml-2"
                                style={{ backgroundColor: COLORS.danger.DEFAULT }}
                                onPress={executeDelete}
                            >
                                <Text className="text-white font-bold">Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
