import React, { useState, useRef } from 'react';
import { 
  View, Text, Modal, TextInput, TouchableOpacity, 
  ScrollView, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (nuevaCita: any) => void;
}

const RegistroCitaModal = ({ visible, onClose, onSave }: Props) => {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    zona: '',
    horas: 1,
    fecha: new Date(),
    horario: '',
    cotizacion: ''
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const horarios = ["09:00", "12:00", "16:00", "17:00", "19:00"];
  
  // Referencia para el input de fecha
  const dateInputRef = useRef<any>(null);

  const ajustarHoras = (monto: number) => {
    setForm(prev => ({ ...prev, horas: Math.max(1, prev.horas + monto) }));
  };

  const handleWebDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setForm({ ...form, fecha: newDate });
    }
    setShowCalendar(false);
  };

  const handleCrear = () => {
    if (!form.nombre || !form.telefono || !form.zona || !form.horario || !form.cotizacion) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios.");
      return;
    }

    const cotizacionNum = parseFloat(form.cotizacion);
    if (isNaN(cotizacionNum) || cotizacionNum <= 0) {
      Alert.alert("Error", "La cotización debe ser un número válido mayor a 0.");
      return;
    }

    const nuevaCita = {
      id: Math.random().toString(),
      ...form,
      cotizacion: cotizacionNum,
      fechaStr: form.fecha.toLocaleDateString('es-ES'),
      fechaCompleta: form.fecha
    };

    onSave(nuevaCita);
    Alert.alert("Éxito", "Sesión registrada correctamente.");
    onClose();
    
    setForm({ 
      nombre: '', 
      telefono: '', 
      zona: '', 
      horas: 1, 
      fecha: new Date(), 
      horario: '', 
      cotizacion: '' 
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-[#121212] p-6 rounded-t-3xl border-t border-gray-800 h-[92%]">
            
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">+ Nueva Cita</Text>
              <TouchableOpacity onPress={onClose}><Text className="text-gray-400 text-2xl">✕</Text></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-400 text-[10px] mb-1 uppercase font-bold">Nombre del Cliente *</Text>
              <TextInput 
                className="bg-[#1e1e1e] text-white p-4 rounded-xl mb-4 border border-gray-800"
                placeholder="Ej. Juan Pérez" placeholderTextColor="#444"
                value={form.nombre} onChangeText={(t) => setForm({...form, nombre: t})}
              />

              <Text className="text-gray-400 text-[10px] mb-1 uppercase font-bold">Zona del Cuerpo *</Text>
              <TextInput 
                className="bg-[#1e1e1e] text-white p-4 rounded-xl mb-4 border border-gray-800"
                placeholder="Ej. Antebrazo" placeholderTextColor="#444"
                value={form.zona} onChangeText={(t) => setForm({...form, zona: t})}
              />

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-gray-400 text-[10px] mb-1 uppercase font-bold">Teléfono *</Text>
                  <TextInput 
                    className="bg-[#1e1e1e] text-white p-4 rounded-xl mb-4 border border-gray-800"
                    keyboardType="number-pad" maxLength={8}
                    value={form.telefono} onChangeText={(t) => setForm({...form, telefono: t.replace(/[^0-9]/g, '')})}
                  />
                </View>
                <View className="w-32">
                  <Text className="text-gray-400 text-[10px] mb-1 uppercase font-bold">Horas *</Text>
                  <View className="bg-[#1e1e1e] flex-row justify-between items-center p-3.5 rounded-xl border border-gray-800">
                    <TouchableOpacity onPress={() => ajustarHoras(-1)}><Text className="text-[#a29bfe] text-xl">▼</Text></TouchableOpacity>
                    <Text className="text-white font-bold">{form.horas}</Text>
                    <TouchableOpacity onPress={() => ajustarHoras(1)}><Text className="text-[#a29bfe] text-xl">▲</Text></TouchableOpacity>
                  </View>
                </View>
              </View>

              <Text className="text-gray-400 text-[10px] mb-1 uppercase font-bold">Fecha *</Text>
              
              {/* Botón con ícono de calendario visible */}
              <TouchableOpacity 
                onPress={() => {
                  if (Platform.OS === 'web' && dateInputRef.current) {
                    dateInputRef.current.showPicker();
                  } else {
                    // Para móvil, puedes implementar el DateTimePicker
                    Alert.alert("Selector de fecha", "En móvil se abrirá el selector nativo");
                  }
                }}
                className="bg-[#1e1e1e] flex-row justify-between items-center p-4 rounded-xl mb-4 border border-gray-800"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">📅</Text>
                  <Text className="text-white text-base">
                    {form.fecha.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                </View>
                <Text className="text-[#a29bfe] text-sm font-bold">Cambiar</Text>
              </TouchableOpacity>

              {/* Input oculto para web */}
              {Platform.OS === 'web' && (
                <input
                  ref={dateInputRef}
                  type="date"
                  value={form.fecha.toISOString().split('T')[0]}
                  onChange={handleWebDateChange}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: 'none'
                  }}
                />
              )}

              <Text className="text-gray-400 text-[10px] mb-2 uppercase font-bold">Horarios Disponibles *</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {horarios.map((h) => (
                  <TouchableOpacity 
                    key={h} 
                    onPress={() => setForm({...form, horario: h})}
                    className={`px-4 py-3 rounded-lg border ${form.horario === h ? 'bg-[#a29bfe] border-[#a29bfe]' : 'bg-[#1e1e1e] border-gray-800'}`}
                  >
                    <Text className={form.horario === h ? 'text-black font-bold' : 'text-white'}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-gray-400 text-[10px] mb-1 uppercase font-bold">Cotización (Bs.) *</Text>
              <TextInput 
                className="bg-[#1e1e1e] text-white p-4 rounded-xl mb-8 border border-gray-800"
                placeholder="0.00" 
                keyboardType="numeric"
                value={form.cotizacion} 
                onChangeText={(t) => setForm({...form, cotizacion: t})}
              />

              <View className="flex-row gap-3 mb-10">
                <TouchableOpacity onPress={onClose} className="flex-1 p-4 rounded-2xl border border-gray-700">
                  <Text className="text-white text-center font-bold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCrear} className="flex-1 p-4 rounded-2xl bg-[#a29bfe]">
                  <Text className="text-black text-center font-bold">Crear Cita</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RegistroCitaModal;