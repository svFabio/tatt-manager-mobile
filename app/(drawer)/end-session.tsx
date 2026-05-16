import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../src/api/axios';

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
      setTintas(resTintas.data?.data || resTintas.data || []);
      setAgujas(resAgujas.data?.data || resAgujas.data || []);
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
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error cerrando sesión:', error.response?.data || error);
      Alert.alert('Error', error.response?.data?.error || 'Hubo un error al cerrar la sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator size="large" color="#E8CC6E" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        
        {/* Selector Sesión */}
        <View className="bg-dark p-5 rounded-xl border border-white/5 mb-4">
          <Text className="text-primary-light text-[10px] font-bold tracking-widest mb-3">SELECCIONAR SESIÓN</Text>
          <TouchableOpacity 
            className="bg-dark-100 h-12 rounded-lg flex-row items-center px-4"
            onPress={() => setDropdownCitaOpen(!dropdownCitaOpen)}
          >
            <Feather name="calendar" size={16} color="#E8CC6E" className="mr-3" />
            <Text className="flex-1 text-white text-sm font-medium">
              {selectedCita ? `${selectedCita.cliente?.nombre ?? (selectedCita as any).clienteNombre} - ${new Date(selectedCita.fechaHoraInicio || (selectedCita as any).fecha).toLocaleDateString()}` : 'Seleccionar sesión...'}
            </Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          
          {dropdownCitaOpen && (
            <View className="mt-2 bg-dark-100 rounded-lg border border-white/5 overflow-hidden">
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
                  <Text className="text-muted-dark text-xs">
                    {new Date(cita.fechaHoraInicio || (cita as any).fecha).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
              {citas.length === 0 && (
                <Text className="text-gray-500 py-3 px-4 text-sm">No hay citas pendientes.</Text>
              )}
            </View>
          )}
        </View>

        {/* Upload Area */}
        <View className="bg-dark p-5 rounded-xl border border-white/5 mb-4">
          <Text className="text-primary-light text-[10px] font-bold tracking-widest mb-3">FOTO DEL RESULTADO FINAL</Text>
          
          <TouchableOpacity 
              className="flex-row justify-center items-center py-4 bg-transparent border border-dashed border-dark-300 rounded-lg mb-3"
              onPress={handlePickImage}
          >
              <Feather name="camera" size={18} color="white" className="mr-2" />
              <Text className="text-white text-[11px] font-bold tracking-widest ml-2">TOCA PARA SUBIR O TOMAR UNA FOTO</Text>
          </TouchableOpacity>

          {fotoBase64 && (
            <View className="w-24 h-24 rounded-lg overflow-hidden border border-dark-300 relative">
              <Image source={{ uri: fotoBase64 }} className="w-full h-full" resizeMode="cover" />
              <TouchableOpacity 
                className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"
                onPress={() => setFotoBase64(null)}
              >
                <Feather name="x" size={12} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Session Notes */}
        <View className="bg-dark p-5 rounded-xl border border-white/5 mb-4">
          <Text className="text-primary-light text-[10px] font-bold tracking-widest mb-3">NOTAS DE LA SESIÓN</Text>
          <View className="bg-dark-100 rounded-lg p-4 h-24 border border-transparent focus:border-[#E8CC6E]/50">
            <TextInput
              className="flex-1 text-white text-sm"
              placeholder="Detalles sobre la sesión..."
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
              value={observaciones}
              onChangeText={setObservaciones}
            />
          </View>
        </View>

        {/* Financials */}
        <View className="bg-dark p-5 rounded-xl border border-white/5 mb-4">
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <Text className="text-muted-dark text-[10px] font-bold tracking-widest mb-2">ANTICIPO RECIBIDO</Text>
              <View className="bg-dark-100 rounded-lg h-11 flex-row items-center px-3 border border-transparent">
                <MaterialCommunityIcons name="cash" size={18} color="#E8CC6E" className="mr-2" />
                <Text className="text-white text-sm flex-1 ml-2">{anticipo}</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-muted-dark text-[10px] font-bold tracking-widest mb-2">COBRO TATUAJE</Text>
              <View className="bg-dark-100 rounded-lg h-11 flex-row items-center px-3 border border-transparent">
                <MaterialCommunityIcons name="cash-register" size={18} color="#E8CC6E" className="mr-2" />
                <TextInput
                  className="flex-1 text-white text-sm ml-2"
                  keyboardType="numeric"
                  placeholder="250"
                  placeholderTextColor="#666"
                  value={cobroTatuaje}
                  onChangeText={setCobroTatuaje}
                />
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-muted-dark text-[10px] font-bold tracking-widest">TOTAL DE SESIÓN</Text>
            <Text className="text-primary-light text-2xl font-black">${totalSesion.toFixed(2)}</Text>
          </View>
        </View>

        {/* Caps Management */}
        <View className="bg-dark p-5 rounded-xl border border-white/5 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-primary-light text-[10px] font-bold tracking-widest">REGISTRO DE CAPS USADOS</Text>
            <TouchableOpacity onPress={() => setCapsUsadas({})}>
              <Feather name="trash-2" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {tintas.map((tinta, index) => (
            <View key={tinta.id} className={`bg-dark-100 rounded-lg p-4 ${index !== tintas.length -1 ? 'mb-3' : ''}`}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tinta.colorHex || '#FFF', borderWidth: 1, borderColor: '#333' }} />
                  <Text className="text-white text-xs font-bold mr-2">{tinta.nombre}</Text>
                  <Text className="text-muted-dark text-[10px]">Stock: {tinta.stock?.reduce((acc, s) => acc + s.cantidadActual, 0) || 0} u</Text>
                </View>
                <View className="bg-dark px-2 py-1 rounded flex-row items-center">
                  <Text className="text-muted-dark text-[10px] mr-1">Marca</Text>
                  <Feather name="chevron-down" size={12} color="#666" />
                </View>
              </View>

              <View className="flex-row justify-start gap-6 px-2 flex-wrap">
                {tinta.stock && tinta.stock.length > 0 ? (
                  tinta.stock.map(stockItem => {
                    const size = stockItem.tamanioCap;
                    const label = size === 'CHICA' ? 'S' : size === 'MEDIANA' ? 'M' : 'L';
                    const count = capsUsadas[tinta.id]?.[size] || 0;
                    return (
                      <View key={size} className="items-center mb-2">
                        <Text className="text-muted-dark text-[10px] font-bold mb-2">
                          {label} <Text className="text-[9px] font-normal">(Stk: {stockItem.cantidadActual})</Text>
                        </Text>
                        <View className="bg-dark rounded-md flex-row items-center">
                          <TouchableOpacity onPress={() => handleCapChange(tinta.id, size, -1)} className="px-3 py-2">
                            <Feather name="minus" size={12} color="#888" />
                          </TouchableOpacity>
                          <Text className="text-white font-bold w-4 text-center text-xs">{count}</Text>
                          <TouchableOpacity onPress={() => handleCapChange(tinta.id, size, 1)} className="px-3 py-2">
                            <Feather name="plus" size={12} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text className="text-muted-dark text-xs py-2">Esta tinta no tiene stock registrado en ningún tamaño.</Text>
                )}
              </View>
            </View>
          ))}
          {tintas.length === 0 && <Text className="text-muted-dark text-xs">No hay tintas en inventario.</Text>}
        </View>

        {/* Agujas Management */}
        <View className="bg-dark p-5 rounded-xl border border-white/5 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-primary-light text-[10px] font-bold tracking-widest">REGISTRO DE AGUJAS USADAS</Text>
            <TouchableOpacity onPress={() => setAgujasUsadasDict({})}>
              <Feather name="trash-2" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {agujas.map((aguja, index) => {
            const count = agujasUsadasDict[aguja.id] || 0;
            return (
              <View key={aguja.id} className={`bg-dark-100 rounded-lg p-4 ${index !== agujas.length -1 ? 'mb-3' : ''}`}>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    <MaterialCommunityIcons name="needle" size={16} color="#FFF" className="mr-2" />
                    <Text className="text-white text-xs font-bold mr-2">{aguja.tipo}</Text>
                    <Text className="text-muted-dark text-[10px]">(Stock: {aguja.cantidadActual} u)</Text>
                  </View>
                  <View className="bg-dark px-2 py-1 rounded flex-row items-center">
                    <Text className="text-muted-dark text-[10px] mr-1">Marca</Text>
                    <Feather name="chevron-down" size={12} color="#666" />
                  </View>
                </View>

                <View className="items-center mt-2">
                  <View className="bg-dark rounded-md flex-row items-center px-4 py-1">
                    <TouchableOpacity onPress={() => handleAgujaChange(aguja.id, -1)} className="px-4 py-2">
                      <Feather name="minus" size={12} color="#888" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold w-12 text-center text-sm">{count}</Text>
                    <TouchableOpacity onPress={() => handleAgujaChange(aguja.id, 1)} className="px-4 py-2">
                      <Feather name="plus" size={12} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
          {agujas.length === 0 && <Text className="text-muted-dark text-xs">No hay agujas en inventario.</Text>}

          {/* Resumen */}
          <View className="bg-[#2A1D00] rounded-lg p-4 mt-4 flex-row border border-[#FFB300]/20">
            <Feather name="info" size={16} color="#FFB300" className="mt-0.5" />
            <View className="flex-1 ml-3">
              <Text className="text-[#FFB300] text-[10px] font-bold tracking-widest mb-1">RESUMEN DE DESCUENTO</Text>
              <Text className="text-[#FFB300]/80 text-[11px] leading-4">
                Se descontarán un total de {totalCapsUsadas} caps y {totalAgujasUsadas} aguja/s del inventario general al finalizar esta sesión.
              </Text>
            </View>
          </View>
        </View>

        {/* Final Action Button */}
        <TouchableOpacity
          className={`flex-row justify-center items-center py-4 rounded-lg mt-2 ${!selectedCitaId || submitting ? 'opacity-50' : ''}`}
          style={{ backgroundColor: '#E8CC6E' }}
          disabled={!selectedCitaId || submitting}
          onPress={handleFinalizar}
        >
          {submitting ? (
             <ActivityIndicator color="#0E0E0E" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#0E0E0E" />
              <Text className="text-[#0E0E0E] text-[11px] font-black tracking-widest ml-2">FINALIZAR SESIÓN Y DESCONTAR STOCK</Text>
            </>
          )}
        </TouchableOpacity>
        
      </ScrollView>
    </View>
  );
}
