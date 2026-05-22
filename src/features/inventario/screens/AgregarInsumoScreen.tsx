import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, Alert, ActivityIndicator, Image,
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { InventarioAPI } from '../../../api/inventario';
import type { Categoria, FotoAsset } from '../../../types/inventario';
import { COLORS, PRIMARY_SHADOW } from '../../../theme/colors';

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
    
    const [capSize, setCapSize] = useState('CHICA');
    const [capMl, setCapMl] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Animaciones de sacudida para cada campo
    const shakeAnims = useRef<Record<string, Animated.Value>>({}).current;

    const getShakeAnim = (field: string) => {
        if (!shakeAnims[field]) shakeAnims[field] = new Animated.Value(0);
        return shakeAnims[field];
    };

    const triggerError = (field: string, message: string) => {
        setErrors(prev => ({ ...prev, [field]: message }));
        const anim = getShakeAnim(field);
        Animated.sequence([
            Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(anim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

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
        let hasErrors = false;
        const newErrors: Record<string, string> = {};

        if (!nombre.trim()) { 
            triggerError('nombre', 'El nombre es requerido');
            hasErrors = true;
        }
        if (!marca.trim()) { 
            triggerError('marca', 'La marca es requerida');
            hasErrors = true;
        }
        
        if (!/^\d+$/.test(stockInicial.trim())) {
            triggerError('stockInicial', 'Debe ser un número entero válido (ej. 0)');
            hasErrors = true;
        }
        
        if (!/^\d+$/.test(stockMinimo.trim())) {
            triggerError('stockMinimo', 'Debe ser un número entero válido (ej. 5)');
            hasErrors = true;
        }

        if (categoria === 'CAP') {
            if (!/^\d+(\.\d+)?$/.test(capMl.trim())) {
                triggerError('capMl', 'Número válido (ej. 1.5)');
                hasErrors = true;
            } else {
                const ml = parseFloat(capMl.trim());
                if (ml <= 0) {
                    triggerError('capMl', 'Debe ser mayor a 0');
                    hasErrors = true;
                }
            }
        }

        if (hasErrors) return;

        const ini = parseInt(stockInicial.trim(), 10);
        const min = parseInt(stockMinimo.trim(), 10);

        setLoading(true);
        try {
            const res = await InventarioAPI.crearInsumo({
                nombre: nombre.trim(),
                categoria,
                marca: marca.trim(),
                stockInicial: ini,
                stockMinimo: min,
                foto: foto ?? undefined,
                ...(categoria === 'CAP' && { capSize, capMl: capMl.trim() }),
            });
            if (res.ok) {
                router.back();
            } else {
                Alert.alert('Error', (res as any).error ?? 'No se pudo guardar el ítem');
            }
        } catch (error: unknown) {
            const e = error as any;
            Alert.alert('Error', e?.response?.data?.error ?? 'Error al guardar el ítem');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        field: string, 
        label: string, 
        value: string, 
        onChangeText: (text: string) => void, 
        placeholder: string, 
        keyboardType: React.ComponentProps<typeof TextInput>['keyboardType'] = "default",
        info?: boolean
    ) => (
        <Animated.View style={{ transform: [{ translateX: getShakeAnim(field) }] }} className="mb-4">
            <View className="flex-row items-center mb-2">
                <Text className="text-text-secondary text-xs font-semibold tracking-widest mr-1">{label}</Text>
                {info && <MaterialIcons name="info-outline" size={13} color={COLORS.text.muted} />}
            </View>
            <View
                className={`rounded-xl px-4 py-3 bg-dark-100 border ${errors[field] ? 'border-danger' : 'border-transparent'}`}
            >
                <TextInput
                    value={value}
                    onChangeText={(text) => {
                        onChangeText(text);
                        clearError(field);
                    }}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.text.dimmed}
                    className="text-white text-sm"
                />
            </View>
            {errors[field] && (
                <Text className="text-xs mt-1 ml-1 font-medium" style={{ color: COLORS.danger.text }}>{errors[field]}</Text>
            )}
        </Animated.View>
    );

    return (
        <SafeAreaView className="flex-1 bg-bg">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 -mt-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text className="text-white text-lg font-semibold">Agregar ítem</Text>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                {renderInput('nombre', 'NOMBRE DEL ITEM', nombre, setNombre, 'Ej: Tinta Verde Intenso')}

                {/* Categoría */}
                <Text className="text-text-secondary text-xs font-semibold tracking-widest mb-2">CATEGORÍA</Text>
                <View className="flex-row rounded-xl p-1 mb-4 bg-dark-100">
                    {CATEGORIAS.map((c) => {
                        const active = categoria === c.value;
                        return (
                            <TouchableOpacity
                                key={c.value}
                                onPress={() => setCategoria(c.value)}
                                className={`flex-1 py-2.5 rounded-lg items-center ${active ? 'bg-primary' : 'bg-transparent'}`}
                                activeOpacity={0.7}
                            >
                                <Text className={`text-sm ${active ? 'text-text-primary font-bold' : 'text-text-muted font-normal'}`}>
                                    {c.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {renderInput('marca', 'MARCA', marca, setMarca, 'Ej: Dynamic')}

                {/* Stock */}
                <View className="flex-row gap-4">
                    <View className="flex-1">
                        {renderInput('stockInicial', 'STOCK INICIAL', stockInicial, setStockInicial, '0', 'numeric')}
                    </View>
                    <View className="flex-1">
                        {renderInput('stockMinimo', 'STOCK MÍNIMO', stockMinimo, setStockMinimo, '5', 'numeric', true)}
                    </View>
                </View>

                {categoria === 'CAP' && (
                    <>
                        <Text className="text-text-secondary text-xs font-semibold tracking-widest mb-2">TAMAÑO DEL CAP</Text>
                        <View className="flex-row rounded-xl p-1 mb-4 bg-dark-100">
                            {['CHICA', 'MEDIANA', 'GRANDE'].map((size) => {
                                const active = capSize === size;
                                return (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => setCapSize(size)}
                                        className={`flex-1 py-2.5 rounded-lg items-center ${active ? 'bg-primary' : 'bg-transparent'}`}
                                        activeOpacity={0.7}
                                    >
                                        <Text className={`text-sm ${active ? 'text-text-primary font-bold' : 'text-text-muted font-normal'}`}>
                                            {size}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {renderInput('capMl', 'CAPACIDAD (MILILITROS)', capMl, setCapMl, 'Ej: 1.5', 'numeric')}
                    </>
                )}

                {/* Unidad */}
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-text-secondary text-sm">Tipo de Unidad Asignada:</Text>
                    <View className="rounded-full px-4 py-1.5 bg-primary">
                        <Text className="text-white text-sm font-semibold">{unidadLabel(categoria)}</Text>
                    </View>
                </View>

                {/* Foto */}
                <Text className="text-text-secondary text-xs font-semibold tracking-widest mb-2">FOTO DEL PRODUCTO (OPCIONAL)</Text>
                <TouchableOpacity
                    onPress={pickImage}
                    className="rounded-xl overflow-hidden mb-4 items-center justify-center h-40 bg-primary-dark"
                >
                    {fotoPreview ? (
                        <Image source={{ uri: fotoPreview }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <View className="items-center">
                            <MaterialIcons name="add-a-photo" size={36} color={COLORS.text.primary} />
                            <Text className="text-white text-sm mt-2">Subir Foto</Text>
                        </View>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Botón guardar */}
            <View className="px-4 pb-6 pt-2 absolute bottom-0 left-0 right-0 bg-bg">
                <TouchableOpacity 
                    className={`flex-row justify-center items-center py-4 rounded-xl mt-4 ${loading ? 'opacity-50' : ''}`}
                    style={{ backgroundColor: COLORS.primary.DEFAULT, ...PRIMARY_SHADOW }}
                    disabled={loading}
                    onPress={handleGuardar}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.text.primary} size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="save" size={20} color={COLORS.text.primary} style={{ marginRight: 8 }} />
                            <Text className="text-white text-sm font-bold">GUARDAR INSUMO</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
