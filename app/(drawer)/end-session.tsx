import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { Text, TextInput } from '@/src/components/StyledText';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../src/api/axios';
import { COLORS, PRIMARY_SHADOW } from '../../src/theme/colors';

// --- Types ---
interface Cita {
  id: number;
  fechaHoraInicio: string;
  estadoCita: string;
  duracionEnHoras: number;
  seniaPagada?: number;
  cliente?: {
    nombre: string;
  };
}

interface Tinta {
  id: number;
  nombre: string;
  marca: string;
  colorHex: string;
  stock: Array<{ tamanioCap: string; cantidadActual: number }>;
}

interface Aguja {
  id: number;
  nombre: string;
  marca: string;
  tipo: string;
  calibre?: string;
  cantidadActual: number;
}

export default function EndSessionScreen() {
  const router = useRouter();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [tintas, setTintas] = useState<Tinta[]>([]);
  const [agujas, setAgujas] = useState<Aguja[]>([]);
  const [emptyCaps, setEmptyCaps] = useState<Aguja[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedCitaId, setSelectedCitaId] = useState<number | null>(null);
  const [dropdownCitaOpen, setDropdownCitaOpen] = useState(false);
  
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [cobroTatuaje, setCobroTatuaje] = useState('');
  
  // Caps State: { [tintaId]: { CHICA: count, MEDIANA: count, GRANDE: count } }
  const [capsUsadas, setCapsUsadas] = useState<Record<number, Record<string, number>>>({});
  
  // Agujas State: { [agujaId]: count }
  const [agujasUsadasDict, setAgujasUsadasDict] = useState<Record<number, number>>({});

  // Computed values
  const selectedCita = citas.find(c => c.id === selectedCitaId);
  const anticipo = selectedCita?.seniaPagada ? Number(selectedCita.seniaPagada) : 0;
  const cobro = Number(cobroTatuaje) || 0;
  const totalSesion = anticipo + cobro;

  const totalCapsUsadas = useMemo(() => {
    let total = 0;
    Object.values(capsUsadas).forEach(tintaCaps => {
      Object.values(tintaCaps).forEach(count => {
        total += count;
      });
    });
    return total;
  }, [capsUsadas]);

  const totalAgujasUsadas = useMemo(() => {
    let total = 0;
    Object.values(agujasUsadasDict).forEach(count => {
      total += count;
    });
    return total;
  }, [agujasUsadasDict]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const resCitas = await api.get('/citas/por-estado?estado=CONFIRMADA');
      const resTintas = await api.get('/tintas');
      const resAgujas = await api.get('/agujas');
      
      const now = new Date();
      const citasPendientes = (resCitas.data?.data || resCitas.data || []).filter(
        (c: Cita) => {
          // Descartar finalizadas o canceladas
          if (c.estadoCita === 'FINALIZADA' || c.estadoCita === 'CANCELADA') return false;
          
          // Solo permitir citas que ya pasaron (o están ocurriendo ahora)
          const citaDate = new Date(c.fechaHoraInicio || (c as any).fecha);
          return citaDate <= now;
        }
      );
      
      setCitas(citasPendientes);

      // Only show items that actually have stock available
      const allTintas: Tinta[] = resTintas.data?.data || resTintas.data || [];
      const tintasConStock = allTintas.filter((t) => {
        const totalStock = (t.stock || []).reduce((sum, s) => sum + (s.cantidadActual || 0), 0);
        return totalStock > 0;
      });
      setTintas(tintasConStock);

      const allAgujas: Aguja[] = resAgujas.data?.data || resAgujas.data || [];
      const agujasConStock = allAgujas.filter((a) => (a.cantidadActual || 0) > 0);
      setAgujas(agujasConStock);

      const allCaps: Aguja[] = resAgujas.data?.caps || [];
      const capsConStock = allCaps.filter((a) => (a.cantidadActual || 0) > 0);
      setEmptyCaps(capsConStock);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de la sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = () => {
    Alert.alert(
      "Subir Foto",
      "Selecciona de dónde quieres subir la foto",
      [
        {
          text: "Cámara",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permiso denegado", "Se requiere permiso para usar la cámara.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.5,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              setFotoBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
          }
        },
        {
          text: "Galería",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permiso denegado", "Se requiere permiso para acceder a las fotos.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.5,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              setFotoBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
          }
        },
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]
    );
  };

  const handleCapChange = (tintaId: number, size: string, delta: number) => {
    setCapsUsadas(prev => {
      const tintaCaps = prev[tintaId] || { CHICA: 0, MEDIANA: 0, GRANDE: 0 };
      const currentCount = tintaCaps[size] || 0;
      const newCount = Math.max(0, currentCount + delta);
      return {
        ...prev,
        [tintaId]: {
          ...tintaCaps,
          [size]: newCount
        }
      };
    });
  };

  const handleAgujaChange = (agujaId: number, delta: number) => {
    setAgujasUsadasDict(prev => {
      const currentCount = prev[agujaId] || 0;
      const newCount = Math.max(0, currentCount + delta);
      return {
        ...prev,
        [agujaId]: newCount
      };
    });
  };

  const handleFinalizar = async () => {
    if (!selectedCitaId) {
      Alert.alert('Error', 'Debes seleccionar una cita.');
      return;
    }

    if (cobro <= 0) {
      Alert.alert('Error', 'El cobro del tatuaje debe ser mayor a 0.');
      return;
    }

    const capsUsadasArray: any[] = [];
    Object.entries(capsUsadas).forEach(([tintaId, sizes]) => {
      Object.entries(sizes).forEach(([size, count]) => {
        if (count > 0) {
          capsUsadasArray.push({
            tintaId: Number(tintaId),
            tamanioCap: size,
            cantidadUsada: count,
          });
        }
      });
    });

    const agujasUsadasArray: any[] = [];
    Object.entries(agujasUsadasDict).forEach(([agujaId, count]) => {
      if (count > 0) {
        agujasUsadasArray.push({
          agujaId: Number(agujaId),
          cantidadUsada: count,
        });
      }
    });

    const payload = {
      citaId: selectedCitaId,
      duracionEnHoras: selectedCita?.duracionEnHoras || 1,
      seniaRecibida: anticipo,
      cobroDelTrabajo: cobro,
      fotoResultadoUrl: fotoBase64,
      observaciones: observaciones,
      capsUsadas: capsUsadasArray,
      agujasUsadas: agujasUsadasArray,
    };

    setSubmitting(true);
    try {
      await api.post('/registro-sesion', payload);
      Alert.alert('Éxito', 'La sesión se cerró y guardó correctamente.', [
        { 
          text: 'OK', 
          onPress: () => {
            setSelectedCitaId(null);
            setFotoBase64(null);
            setObservaciones('');
            setCobroTatuaje('');
            setCapsUsadas({});
            setAgujasUsadasDict({});
            router.back();
          } 
        }
      ]);
    } catch (error: any) {
      console.warn('Error cerrando sesión:', error.response?.data || error);
      Alert.alert('No se pudo finalizar', error.response?.data?.error || 'Hubo un error al cerrar la sesión. Revisa tu conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bg justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary.light} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20, paddingBottom: 80 }}>
        
        {/* Selector Sesión */}
        <View className="mb-5">
          <Text className="text-text-secondary text-xs font-semibold tracking-widest mb-2">SELECCIONAR SESIÓN</Text>
          <TouchableOpacity 
            className="bg-dark-100 rounded-xl flex-row items-center px-4 py-3 border border-transparent h-12"
            onPress={() => setDropdownCitaOpen(!dropdownCitaOpen)}
          >
            <Feather name="calendar" size={16} color={COLORS.primary.light} style={{ marginRight: 8 }} />
            <Text className="flex-1 text-white text-sm font-medium" numberOfLines={1}>
              {selectedCita ? `${selectedCita.cliente?.nombre ?? (selectedCita as any).clienteNombre} - ${new Date(selectedCita.fechaHoraInicio || (selectedCita as any).fecha).toLocaleDateString()}` : 'Seleccionar sesión...'}
            </Text>
            <Feather name="chevron-down" size={16} color={COLORS.text.muted} />
          </TouchableOpacity>
          
          {dropdownCitaOpen && (
            <View className="mt-2 bg-dark-100 rounded-xl border border-white/5 overflow-hidden">
              {citas.map(cita => (
                <TouchableOpacity
                  key={cita.id}
                  className="px-4 py-3 border-b border-white/5"
                  onPress={() => {
                    setSelectedCitaId(cita.id);
                    setDropdownCitaOpen(false);
                  }}
                >
                  <Text className="text-white text-sm font-bold">
                    {cita.cliente?.nombre ?? (cita as any).clienteNombre}
                  </Text>
                  <Text className="text-muted-dark text-xs mt-0.5">
                    {new Date(cita.fechaHoraInicio || (cita as any).fecha).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
              {citas.length === 0 && (
                <Text className="py-3 px-4 text-sm" style={{ color: COLORS.text.muted }}>No hay citas pendientes.</Text>
              )}
            </View>
          )}
        </View>

        {selectedCitaId ? (
          <>
            {/* Foto del resultado */}
            <View className="mb-5">
              <Text className="text-text-secondary text-xs font-semibold tracking-widest mb-2">FOTO DEL RESULTADO FINAL</Text>
              <TouchableOpacity 
                  onPress={handlePickImage}
                  className="rounded-xl overflow-hidden items-center justify-center h-40 bg-dark-100 border border-transparent"
              >
                  {fotoBase64 ? (
                    <View className="w-full h-full relative">
                      <Image source={{ uri: fotoBase64 }} className="w-full h-full" resizeMode="cover" />
                      <TouchableOpacity 
                        className="absolute top-2 right-2 bg-black/60 p-2 rounded-full"
                        onPress={() => setFotoBase64(null)}
                      >
                        <Feather name="x" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Feather name="camera" size={32} color={COLORS.text.primary} />
                      <Text className="text-white text-sm mt-2 font-semibold">Toca para tomar o subir una foto</Text>
                    </View>
                  )}
              </TouchableOpacity>
            </View>

            {/* Notas de la sesión */}
            <View className="mb-5">
              <Text className="text-text-secondary text-xs font-semibold tracking-widest mb-2">NOTAS DE LA SESIÓN</Text>
              <View className="rounded-xl px-4 py-3 bg-dark-100 border border-transparent h-28">
                <TextInput
                  className="flex-1 text-white text-sm"
                  placeholder="Detalles sobre la sesión..."
                  placeholderTextColor={COLORS.text.dimmed}
                  multiline
                  textAlignVertical="top"
                  value={observaciones}
                  onChangeText={setObservaciones}
                />
              </View>
            </View>

            {/* Cobro y Anticipo */}
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-semibold tracking-widest mb-2">ANTICIPO RECIBIDO</Text>
                <View className="rounded-xl px-4 py-3 bg-dark-100 border border-transparent flex-row items-center h-12">
                  <MaterialCommunityIcons name="cash" size={18} color={COLORS.primary.light} style={{ marginRight: 8 }} />
                  <Text className="text-white text-sm font-semibold">{anticipo}</Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-text-secondary text-xs font-semibold tracking-widest mb-2">COBRO TATUAJE</Text>
                <View className="rounded-xl px-4 py-3 bg-dark-100 border border-transparent flex-row items-center h-12">
                  <MaterialCommunityIcons name="cash-register" size={18} color={COLORS.primary.light} style={{ marginRight: 8 }} />
                  <TextInput
                    className="flex-1 text-white text-sm"
                    keyboardType="numeric"
                    placeholder="250"
                    placeholderTextColor={COLORS.text.dimmed}
                    value={cobroTatuaje}
                    onChangeText={setCobroTatuaje}
                  />
                </View>
              </View>
            </View>

            {/* Total Sesión Card */}
            <View className="rounded-xl px-4 py-4 bg-dark-100 border border-transparent flex-row justify-between items-center mb-6">
              <Text className="text-text-secondary text-xs font-semibold tracking-widest">TOTAL DE SESIÓN</Text>
              <Text className="text-primary-light text-2xl font-black">Bs. {totalSesion.toFixed(2)}</Text>
            </View>

            {/* Caps Management */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-text-secondary text-xs font-semibold tracking-widest">REGISTRO DE CAPS USADOS</Text>
                <TouchableOpacity onPress={() => setCapsUsadas({})}>
                  <Feather name="trash-2" size={16} color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>

              {tintas.map((tinta, index) => (
                <View key={tinta.id} className="bg-dark-100 rounded-xl p-4 mb-3 border border-transparent">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tinta.colorHex || COLORS.text.primary, borderWidth: 1, borderColor: COLORS.dark[300] }} />
                      <Text className="text-white text-xs font-bold mr-2">{tinta.nombre}</Text>
                      <Text className="text-text-secondary text-[10px]">Stock total: {tinta.stock?.[0]?.cantidadActual || 0} ml</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-around w-full px-2 mt-1">
                    {emptyCaps.map(capItem => {
                      const size = capItem.tipo;
                      const label = size === 'CHICA' ? 'S' : size === 'MEDIANA' ? 'M' : size === 'GRANDE' ? 'L' : size;
                      const count = capsUsadas[tinta.id]?.[size] || 0;
                      return (
                        <View key={size} className="items-center">
                          <Text className="text-text-secondary text-[10px] font-semibold mb-2">
                            {label} <Text className="text-[9px] font-normal" style={{ color: COLORS.text.muted }}>(Stk: {capItem.cantidadActual})</Text>
                          </Text>
                          <View className="bg-dark rounded-lg flex-row items-center">
                            <TouchableOpacity onPress={() => handleCapChange(tinta.id, size, -1)} className="px-3 py-2">
                              <Feather name="minus" size={12} color={COLORS.text.secondary} />
                            </TouchableOpacity>
                            <Text className="text-white font-bold w-5 text-center text-xs">{count}</Text>
                            <TouchableOpacity onPress={() => handleCapChange(tinta.id, size, 1)} className="px-3 py-2">
                              <Feather name="plus" size={12} color={COLORS.text.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                    {emptyCaps.length === 0 && (
                      <Text className="text-text-muted text-xs py-2 text-center w-full">No hay caps vacías en el inventario.</Text>
                    )}
                  </View>
                </View>
              ))}
              {tintas.length === 0 && <Text className="text-text-muted text-xs ml-1">No hay tintas en inventario.</Text>}
            </View>

            {/* Agujas Management */}
            <View className="mb-5">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-text-secondary text-xs font-semibold tracking-widest">REGISTRO DE AGUJAS USADAS</Text>
                <TouchableOpacity onPress={() => setAgujasUsadasDict({})}>
                  <Feather name="trash-2" size={16} color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>

              {agujas.map((aguja) => {
                const count = agujasUsadasDict[aguja.id] || 0;
                return (
                  <View key={aguja.id} className="bg-dark-100 rounded-xl p-4 mb-3 border border-transparent flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-4">
                      <MaterialCommunityIcons name="needle" size={16} color={COLORS.text.primary} style={{ marginRight: 8 }} />
                      <View>
                        <Text className="text-white text-xs font-bold">{aguja.nombre}</Text>
                        <Text className="text-text-secondary text-[10px]">Stock: {aguja.cantidadActual} u</Text>
                      </View>
                    </View>

                    <View className="bg-dark rounded-lg flex-row items-center">
                      <TouchableOpacity onPress={() => handleAgujaChange(aguja.id, -1)} className="px-3 py-2">
                        <Feather name="minus" size={12} color={COLORS.text.secondary} />
                      </TouchableOpacity>
                      <Text className="text-white font-bold w-8 text-center text-xs">{count}</Text>
                      <TouchableOpacity onPress={() => handleAgujaChange(aguja.id, 1)} className="px-3 py-2">
                        <Feather name="plus" size={12} color={COLORS.text.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              {agujas.length === 0 && <Text className="text-text-muted text-xs ml-1">No hay agujas en inventario.</Text>}

              {/* Resumen */}
              <View
                className="rounded-xl p-4 mt-3 flex-row"
                style={{
                  backgroundColor: COLORS.warning.ghost,
                  borderWidth: 1,
                  borderColor: 'rgba(245, 158, 11, 0.2)',
                }}
              >
                <Feather name="info" size={16} color={COLORS.warning.text} style={{ marginTop: 2 }} />
                <View className="flex-1 ml-3">
                  <Text className="text-[10px] font-bold tracking-widest mb-1" style={{ color: COLORS.warning.text }}>RESUMEN DE DESCUENTO</Text>
                  <Text className="text-[11px] leading-4" style={{ color: COLORS.warning.DEFAULT }}>
                    Se descontarán un total de {totalCapsUsadas} caps y {totalAgujasUsadas} aguja/s del inventario general al finalizar esta sesión.
                  </Text>
                </View>
              </View>
            </View>

            {/* Final Action Button */}
            <TouchableOpacity
              className={`flex-row justify-center items-center py-4 rounded-xl mt-4 ${!selectedCitaId || submitting ? 'opacity-50' : ''}`}
              style={{ 
                backgroundColor: COLORS.gold.light,
                shadowColor: COLORS.gold.light,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
                elevation: 6
              }}
              disabled={!selectedCitaId || submitting}
              onPress={handleFinalizar}
            >
              {submitting ? (
                 <ActivityIndicator color={COLORS.bg} size="small" />
              ) : (
                <>
                  <Feather name="check-circle" size={18} color={COLORS.bg} style={{ marginRight: 8 }} />
                  <Text className="text-bg text-sm font-bold">FINALIZAR SESIÓN Y DESCONTAR STOCK</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View className="bg-dark-100 p-6 rounded-xl border border-white/5 items-center justify-center py-12 mt-4">
            <Feather name="info" size={32} color={COLORS.text.muted} style={{ marginBottom: 12 }} />
            <Text className="text-white text-center text-sm font-semibold mb-1">
              No se ha seleccionado ninguna sesión
            </Text>
            <Text className="text-center text-xs" style={{ color: COLORS.text.muted }}>
              Por favor, selecciona una cita confirmada en la parte superior para registrar el progreso, cobro e insumos utilizados de la sesión.
            </Text>
          </View>
        )}
        
      </ScrollView>
    </View>
  );
}
