import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { InventarioAPI } from '../../../api/inventario';
import type { Categoria, FotoAsset } from '../../../types/inventario';

const CATEGORIAS: { label: string; value: Categoria }[] = [
    { label: 'Tintas', value: 'TINTA' },
    { label: 'Agujas', value: 'AGUJA' },
    { label: 'Caps', value: 'CAP' },
];

const unidadLabel = (cat: Categoria) => (cat === 'TINTA' ? 'Mililitros (ml)' : 'Unidades (un)');

export default function AgregarInsumoScreen() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState<Categoria>('TINTA');
    const [marca, setMarca] = useState('');
    const [stockInicial, setStockInicial] = useState('0');
    const [stockMinimo, setStockMinimo] = useState('5');
    const [foto, setFoto] = useState<FotoAsset | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const name = asset.uri.split('/').pop() ?? 'foto.jpg';
            const type = asset.mimeType ?? 'image/jpeg';
            setFoto({ uri: asset.uri, name, type });
            setFotoPreview(asset.uri);
        }
    };

    const handleGuardar = async () => {
        if (!nombre.trim()) { Alert.alert('Error', 'El nombre es requerido'); return; }
        if (!marca.trim()) { Alert.alert('Error', 'La marca es requerida'); return; }
        const ini = parseInt(stockInicial, 10);
        const min = parseInt(stockMinimo, 10);
        if (isNaN(ini) || ini < 0 || isNaN(min) || min < 0) {
            Alert.alert('Error', 'Stock inicial y mínimo deben ser enteros no negativos');
            return;
        }

        setLoading(true);
        try {
            const res = await InventarioAPI.crearInsumo({
                nombre: nombre.trim(),
                categoria,
                marca: marca.trim(),
                stockInicial: ini,
                stockMinimo: min,
                foto: foto ?? undefined,
            });
            if (res.ok) {
                router.back();
            } else {
                Alert.alert('Error', (res as any).error ?? 'No se pudo guardar el ítem');
            }
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.error ?? 'Error al guardar el ítem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#0A0A0A]">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 -mt-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-semibold">Agregar ítem</Text>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                {/* Nombre */}
                <Text className="text-gray-400 text-xs font-semibold tracking-widest mt-4 mb-2">NOMBRE DEL ITEM</Text>
                <View className="bg-dark-100 rounded-xl px-4 py-3 mb-4">
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Ej: Tinta Verde Intenso"
                        placeholderTextColor="#4B5563"
                        className="text-white text-sm"
                    />
                </View>

                {/* Categoría */}
                <Text className="text-gray-400 text-xs font-semibold tracking-widest mb-2">CATEGORÍA</Text>
                <View className="flex-row bg-dark-100 rounded-xl p-1 mb-4">
                    {CATEGORIAS.map((c) => {
                        const active = categoria === c.value;
                        return (
                            <TouchableOpacity
                                key={c.value}
                                onPress={() => setCategoria(c.value)}
                                className="flex-1 py-2 rounded-lg items-center"
                                style={{ backgroundColor: active ? '#FFFFFF' : 'transparent' }}
                            >
                                <Text style={{ color: active ? '#0A0A0A' : '#6B7280', fontWeight: active ? '700' : '400', fontSize: 14 }}>
                                    {c.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Marca */}
                <Text className="text-gray-400 text-xs font-semibold tracking-widest mb-2">MARCA</Text>
                <View className="bg-dark-100 rounded-xl px-4 py-3 mb-4">
                    <TextInput
                        value={marca}
                        onChangeText={setMarca}
                        placeholder="Ej: Dynamic"
                        placeholderTextColor="#4B5563"
                        className="text-white text-sm"
                    />
                </View>

                {/* Stock */}
                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <Text className="text-gray-400 text-xs font-semibold tracking-widest mb-2">STOCK INICIAL</Text>
                        <View className="bg-dark-100 rounded-xl px-4 py-3">
                            <TextInput
                                value={stockInicial}
                                onChangeText={setStockInicial}
                                keyboardType="numeric"
                                placeholderTextColor="#4B5563"
                                className="text-white text-sm"
                            />
                        </View>
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <Text className="text-gray-400 text-xs font-semibold tracking-widest mr-1">STOCK MÍNIMO</Text>
                            <MaterialIcons name="info-outline" size={13} color="#6B7280" />
                        </View>
                        <View className="bg-dark-100 rounded-xl px-4 py-3">
                            <TextInput
                                value={stockMinimo}
                                onChangeText={setStockMinimo}
                                keyboardType="numeric"
                                placeholderTextColor="#4B5563"
                                className="text-white text-sm"
                            />
                        </View>
                    </View>
                </View>

                {/* Unidad */}
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-gray-400 text-sm">Tipo de Unidad Asignada:</Text>
                    <View className="rounded-full px-4 py-1.5" style={{ backgroundColor: '#D4AF37' }}>
                        <Text className="text-white text-sm font-semibold">{unidadLabel(categoria)}</Text>
                    </View>
                </View>

                {/* Foto */}
                <Text className="text-gray-400 text-xs font-semibold tracking-widest mb-2">FOTO DEL PRODUCTO (OPCIONAL)</Text>
                <TouchableOpacity
                    onPress={pickImage}
                    className="rounded-xl overflow-hidden mb-4 items-center justify-center"
                    style={{ backgroundColor: '#2D1F6E', height: 160 }}
                >
                    {fotoPreview ? (
                        <Image source={{ uri: fotoPreview }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View className="items-center">
                            <MaterialIcons name="add-a-photo" size={36} color="#FFFFFF" />
                            <Text className="text-white text-sm mt-2">Cambiar Foto</Text>
                        </View>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Botón guardar */}
            <View className="px-4 pb-6 pt-2 absolute bottom-0 left-0 right-0 bg-[#0A0A0A]">
                <TouchableOpacity
                    onPress={handleGuardar}
                    disabled={loading}
                    className="rounded-2xl py-4 items-center flex-row justify-center"
                    style={{ backgroundColor: '#D4AF37' }}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="save" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold text-base">Guardar ítem</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
