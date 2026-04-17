import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const RegistroCitaModal = ({ visible, onClose }: Props) => {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    horas: '01',
    fecha: '2026-10-24',
    horario: '',
    cotizacion: ''
  });

  const horarios = ["09:00", "12:00", "16:00", "17:00", "19:00"];

  const handleCrear = () => {
    // Criterio de aceptación 2: Todos los campos obligatorios deben estar completos [cite: 461]
    if (!form.nombre || !form.telefono || !form.horario || !form.cotizacion) {
      Alert.alert("Error", "Todos los campos obligatorios deben estar completos.");
      return;
    }
    
    // Criterio de aceptación 5: Mensaje de éxito visible [cite: 464]
    Alert.alert("Éxito", "Sesión registrada correctamente");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/80">
        <View className="bg-[#121212] p-6 rounded-t-3xl border-t border-gray-800">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">+ Nueva Cita</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
             {/* Criterio 1: Permitir ingresar nombre, fecha y hora [cite: 460] */}
            <Text className="text-gray-400 text-xs mb-1">Nombre del Cliente *</Text>
            <TextInput 
              className="bg-[#1e1e1e] text-white p-3 rounded-lg mb-4 border border-gray-800"
              placeholder="Ej. Juan Pérez"
              placeholderTextColor="#555"
              value={form.nombre}
              onChangeText={(val) => setForm({...form, nombre: val})}
            />

            <Text className="text-gray-400 text-xs mb-1">Teléfono *</Text>
            <TextInput 
              className="bg-[#1e1e1e] text-white p-3 rounded-lg mb-4 border border-gray-800"
              placeholder="591 70000000"
              placeholderTextColor="#555"
              keyboardType="phone-pad"
              value={form.telefono}
              onChangeText={(val) => setForm({...form, telefono: val})}
            />

            <Text className="text-gray-400 text-xs mb-2">Horario *</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {horarios.map((h) => (
                <TouchableOpacity 
                  key={h}
                  onPress={() => setForm({...form, horario: h})}
                  className={`p-3 rounded-lg border ${form.horario === h ? 'bg-[#a29bfe] border-[#a29bfe]' : 'bg-[#1e1e1e] border-gray-800'}`}
                >
                  <Text className={form.horario === h ? 'text-black font-bold' : 'text-white'}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-400 text-xs mb-1">Cotización *</Text>
            <TextInput 
              className="bg-[#1e1e1e] text-white p-3 rounded-lg mb-6 border border-gray-800"
              placeholder="Ej. 500"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={form.cotizacion}
              onChangeText={(val) => setForm({...form, cotizacion: val})}
            />

            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity onPress={onClose} className="flex-1 p-4 rounded-xl border border-gray-700">
                <Text className="text-white text-center font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCrear} className="flex-1 p-4 rounded-xl bg-[#a29bfe]">
                <Text className="text-black text-center font-bold">Crear Cita</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RegistroCitaModal;