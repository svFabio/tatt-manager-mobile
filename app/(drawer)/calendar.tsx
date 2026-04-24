import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, TouchableOpacity, ScrollView, 
  RefreshControl, Alert, ActivityIndicator 
} from "react-native";
import RegistroCitaModal from "../../src/components/ui/RegistroCita";
import { sessionService, Session } from "../../src/services/sessionService";

export default function CalendarScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [sesiones, setSesiones] = useState<Session[]>([]);
  const [sesionesFiltradas, setSesionesFiltradas] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Cargar todas las sesiones
  const cargarSesiones = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getAll(1);
      console.log('📋 Sesiones cargadas:', data.length);
      setSesiones(data);
      filtrarSesionesPorMes(data, currentMonth, currentYear);
    } catch (error: any) {
      console.error('Error cargando:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por mes
  const filtrarSesionesPorMes = (sesionesList: Session[], month: number, year: number) => {
    const filtradas = sesionesList.filter(sesion => {
      const fecha = new Date(sesion.fecha);
      return fecha.getMonth() === month && fecha.getFullYear() === year;
    });
    const ordenadas = filtradas.sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
    setSesionesFiltradas(ordenadas);
    console.log(`📅 ${nombresMeses[month]} ${year}: ${ordenadas.length} sesiones`);
  };

  // Cambiar mes
  const cambiarMes = (direccion: 'prev' | 'next') => {
    let nuevoMes = currentMonth;
    let nuevoAño = currentYear;
    
    if (direccion === 'prev') {
      if (currentMonth === 0) {
        nuevoMes = 11;
        nuevoAño = currentYear - 1;
      } else {
        nuevoMes = currentMonth - 1;
      }
    } else {
      if (currentMonth === 11) {
        nuevoMes = 0;
        nuevoAño = currentYear + 1;
      } else {
        nuevoMes = currentMonth + 1;
      }
    }
    
    setCurrentMonth(nuevoMes);
    setCurrentYear(nuevoAño);
    filtrarSesionesPorMes(sesiones, nuevoMes, nuevoAño);
  };

  useEffect(() => {
    cargarSesiones();
  }, []);

  useEffect(() => {
    filtrarSesionesPorMes(sesiones, currentMonth, currentYear);
  }, [currentMonth, currentYear, sesiones]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarSesiones();
    setRefreshing(false);
  }, []);

  // Crear sesión
  const agregarSesion = async (nuevaCita: any) => {
    try {
      console.log('📝 Datos recibidos:', nuevaCita);

      if (!nuevaCita.nombre || !nuevaCita.telefono || !nuevaCita.zona || !nuevaCita.horario || !nuevaCita.cotizacion) {
        Alert.alert('❌ Error', 'Por favor, completa todos los campos obligatorios.');
        return;
      }

      if (nuevaCita.telefono.length !== 8) {
        Alert.alert('❌ Error', 'El teléfono debe tener 8 dígitos.');
        return;
      }

      const cotizacionNum = parseFloat(nuevaCita.cotizacion);
      if (isNaN(cotizacionNum) || cotizacionNum <= 0) {
        Alert.alert('❌ Error', 'La cotización debe ser un número mayor a 0.');
        return;
      }

      if (nuevaCita.horas <= 0) {
        Alert.alert('❌ Error', 'Las horas deben ser al menos 1.');
        return;
      }

      const fechaOriginal = nuevaCita.fecha;
      const año = fechaOriginal.getFullYear();
      const mes = String(fechaOriginal.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaOriginal.getDate()).padStart(2, '0');
      const fechaFormateada = `${año}-${mes}-${dia}`;

      await sessionService.create({
        nombre: nuevaCita.nombre,
        telefono: nuevaCita.telefono,
        zona: nuevaCita.zona,
        horas: nuevaCita.horas,
        fecha: fechaFormateada,
        horario: nuevaCita.horario,
        cotizacion: cotizacionNum,
      });

      // ✅ Alerta de éxito
      Alert.alert(
        '✅ ¡Éxito!',
        `Sesión registrada correctamente para ${nuevaCita.nombre}\n📅 Fecha: ${fechaFormateada}\n⏰ Hora: ${nuevaCita.horario}\n💰 Monto: Bs. ${cotizacionNum}`,
        [{ text: 'OK' }]
      );

      await cargarSesiones();

    } catch (error: any) {
      console.error('❌ Error:', error);

      // ⚠️ Alerta de horario ocupado
      if (error.message.includes('horario') || error.message.includes('ocupado')) {
        Alert.alert(
          '⚠️ Horario No Disponible',
          `${error.message}\n\nPor favor, selecciona otro horario para esta fecha.`,
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert('❌ Error', error.message || 'Error al guardar la sesión');
      }
    }
  };

  // Eliminar sesión
  const eliminarSesion = async (id: number, nombre: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Eliminar sesión de "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await sessionService.delete(id);
              await cargarSesiones();
              Alert.alert('✅ Éxito', 'Sesión eliminada correctamente');
            } catch (error: any) {
              Alert.alert('❌ Error', error.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#121212] justify-center items-center">
        <ActivityIndicator size="large" color="#a29bfe" />
        <Text className="text-gray-400 mt-4">Cargando sesiones...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212] p-4">
      <View className="items-center mb-4">
        <Text className="text-white text-2xl font-bold">Calendario</Text>
      </View>

      {/* Selector de mes */}
      <View className="flex-row justify-between items-center mb-6 bg-[#1e1e1e] p-4 rounded-2xl">
        <TouchableOpacity onPress={() => cambiarMes('prev')} className="bg-[#2a2a2a] p-3 rounded-full">
          <Text className="text-white text-xl">◀</Text>
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-white text-xl font-bold uppercase">{nombresMeses[currentMonth]}</Text>
          <Text className="text-gray-500 text-sm">{currentYear}</Text>
        </View>
        
        <TouchableOpacity onPress={() => cambiarMes('next')} className="bg-[#2a2a2a] p-3 rounded-full">
          <Text className="text-white text-xl">▶</Text>
        </TouchableOpacity>
      </View>

      {/* Contador */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">
          Sesiones ({sesionesFiltradas.length})
        </Text>
        <TouchableOpacity onPress={onRefresh} className="p-2">
          <Text className="text-[#a29bfe] text-sm">🔄 Actualizar</Text>
        </TouchableOpacity>
      </View>

      {sesionesFiltradas.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 text-center text-lg">
            📅 No hay sesiones en {nombresMeses[currentMonth]} {currentYear}
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-row border-b border-gray-800 pb-3 mb-2 px-2">
            <Text className="flex-1 text-gray-500 font-bold text-[10px] uppercase">Cliente</Text>
            <Text className="w-24 text-gray-500 font-bold text-[10px] uppercase text-center">Fecha</Text>
            <Text className="w-16 text-gray-500 font-bold text-[10px] uppercase text-right">Hora</Text>
            <Text className="w-12 text-gray-500 font-bold text-[10px] uppercase text-center"></Text>
          </View>

          <ScrollView 
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a29bfe" />}
          >
            {sesionesFiltradas.map((item) => {
              const fecha = new Date(item.fecha);
              return (
                <View key={item.id} className="flex-row items-center p-3 border-b border-gray-900">
                  <View className="flex-1">
                    <Text className="text-white font-medium">{item.nombre}</Text>
                    <Text className="text-gray-500 text-xs">{item.zona}</Text>
                    <Text className="text-[#a29bfe] text-xs font-bold">Bs. {item.cotizacion}</Text>
                  </View>
                  
                  <Text className="w-24 text-gray-400 text-center text-xs">
                    {fecha.getDate()}/{fecha.getMonth() + 1}
                  </Text>
                  
                  <Text className="w-16 text-[#a29bfe] text-right font-bold">{item.horario}</Text>
                  
                  <TouchableOpacity onPress={() => eliminarSesion(item.id, item.nombre)} className="w-12 items-center p-2">
                    <Text className="text-red-500 text-lg">🗑️</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-10 right-8 bg-[#a29bfe] w-16 h-16 rounded-full items-center justify-center shadow-2xl"
        style={{ elevation: 10, zIndex: 50 }}
      >
        <Text className="text-black text-4xl font-light">+</Text>
      </TouchableOpacity>

      <RegistroCitaModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={agregarSesion} />
    </View>
  );
}