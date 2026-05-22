import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS } from '../../theme/colors';
import api from '../../api/axios';

interface SessionForm {
  nombre: string;
  telefono: string;
  zona: string;
  tamano: string;
  horas: number;
  fecha: Date;
  horario: string;
  cotizacion: string;
}

interface FieldErrors {
  nombre?: boolean;
  telefono?: boolean;
  zona?: boolean;
  tamano?: boolean;
  horario?: boolean;
  cotizacion?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (nuevaCita: Omit<SessionForm, 'cotizacion'> & { cotizacion: number }) => void;
  selectedDate?: Date;
}

const RegistroCitaModal = ({ visible, onClose, onSave, selectedDate }: Props) => {
  const [form, setForm] = useState<SessionForm>({
    nombre: '',
    telefono: '',
    zona: '',
    tamano: '',
    horas: 1,
    fecha: new Date(),
    horario: '',
    cotizacion: ''
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [horarios, setHorarios] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Shake animations per field
  const shakeAnims = useRef<Record<string, Animated.Value>>({
    nombre: new Animated.Value(0),
    telefono: new Animated.Value(0),
    zona: new Animated.Value(0),
    tamano: new Animated.Value(0),
    horario: new Animated.Value(0),
    cotizacion: new Animated.Value(0),
  }).current;

  const shakeField = (field: string) => {
    Animated.sequence([
      Animated.timing(shakeAnims[field], { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnims[field], { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnims[field], { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnims[field], { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnims[field], { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Fetch real available schedules from backend
  const fetchHorarios = useCallback(async (fecha: Date, duracion: number) => {
    setLoadingHorarios(true);
    setHorarios([]);
    setForm(prev => ({ ...prev, horario: '' })); // Reset selected
    try {
      const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
      const res = await api.get('/citas/horarios-disponibles', { params: { fecha: fechaStr, duracion } });
      const data = res.data?.horarios ?? res.data?.data?.horarios ?? [];
      setHorarios(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[RegistroCita] Error fetching horarios:', e);
      setHorarios([]);
    } finally {
      setLoadingHorarios(false);
    }
  }, []);

  // Load horarios when modal opens, fecha changes, or horas changes
  useEffect(() => {
    if (visible) {
      fetchHorarios(form.fecha, form.horas);
    }
  }, [visible, form.fecha, form.horas, fetchHorarios]);

  const ajustarHoras = (monto: number) => {
    setForm(prev => ({ ...prev, horas: Math.max(1, Math.min(12, prev.horas + monto)), horario: '' }));
  };

  const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      // Don't allow past dates
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (selected < hoy) {
        Alert.alert('Fecha inválida', 'No puedes agendar en una fecha pasada.');
        return;
      }
      setForm(prev => ({ ...prev, fecha: selected }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    let valid = true;

    if (!form.nombre.trim() || form.nombre.trim().length < 3) {
      newErrors.nombre = true;
      shakeField('nombre');
      valid = false;
    }
    if (!form.telefono || form.telefono.replace(/[^0-9]/g, '').length < 7) {
      newErrors.telefono = true;
      shakeField('telefono');
      valid = false;
    }
    if (!form.zona.trim()) {
      newErrors.zona = true;
      shakeField('zona');
      valid = false;
    }
    // Tamano is optional, no validation required
    if (!form.horario) {
      newErrors.horario = true;
      shakeField('horario');
      valid = false;
    }
    const cot = parseFloat(form.cotizacion);
    if (!form.cotizacion || isNaN(cot) || cot <= 0) {
      newErrors.cotizacion = true;
      shakeField('cotizacion');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCrear = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        ...form,
        cotizacion: parseFloat(form.cotizacion),
      });
    } catch (e: unknown) {
      // Error handling is done in the parent (calendar.tsx)
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      nombre: '', telefono: '', zona: '', tamano: '', horas: 1,
      fecha: new Date(), horario: '', cotizacion: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const inputStyle = (field: keyof FieldErrors) => ({
    backgroundColor: COLORS.dark[100],
    borderWidth: 1.5,
    borderColor: errors[field] ? COLORS.danger.DEFAULT : COLORS.dark[200],
  });

  const labelStyle = (field: keyof FieldErrors) => ({
    color: errors[field] ? COLORS.danger.text : COLORS.text.muted,
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 justify-end bg-black/80">
          <View className="p-6 rounded-t-3xl h-[92%]" style={{ backgroundColor: COLORS.dark.DEFAULT, borderTopWidth: 1, borderColor: COLORS.dark[200] }}>

            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center">
                <MaterialIcons name="event-note" size={22} color={COLORS.primary.DEFAULT} />
                <Text className="text-white text-xl font-bold ml-2">Nueva Cita</Text>
              </View>
              <TouchableOpacity onPress={handleClose} className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: COLORS.dark[200] }}>
                <MaterialIcons name="close" size={18} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Nombre */}
              <Animated.View style={{ transform: [{ translateX: shakeAnims.nombre }] }}>
                <Text className="text-[10px] mb-1.5 uppercase font-bold tracking-widest" style={labelStyle('nombre')}>Nombre del Cliente *</Text>
                <TextInput
                  className="text-white p-4 rounded-xl mb-4"
                  style={inputStyle('nombre')}
                  placeholder="Ej. Juan Pérez"
                  placeholderTextColor={COLORS.text.dimmed}
                  value={form.nombre}
                  onChangeText={(t) => { setForm({ ...form, nombre: t }); setErrors(e => ({ ...e, nombre: false })); }}
                />
              </Animated.View>

              {/* Zona + Tamaño */}
              <View className="flex-row mb-4" style={{ gap: 12 }}>
                <Animated.View style={{ flex: 1, transform: [{ translateX: shakeAnims.zona }] }}>
                  <Text className="text-[10px] mb-1.5 uppercase font-bold tracking-widest" style={labelStyle('zona')}>Zona del Cuerpo *</Text>
                  <TextInput
                    className="text-white p-4 rounded-xl"
                    style={inputStyle('zona')}
                    placeholder="Ej. Antebrazo"
                    placeholderTextColor={COLORS.text.dimmed}
                    value={form.zona}
                    onChangeText={(t) => { setForm({ ...form, zona: t }); setErrors(e => ({ ...e, zona: false })); }}
                  />
                </Animated.View>

                <Animated.View style={{ flex: 1, transform: [{ translateX: shakeAnims.tamano }] }}>
                  <Text className="text-[10px] mb-1.5 uppercase font-bold tracking-widest" style={labelStyle('tamano')}>Tamaño</Text>
                  <TextInput
                    className="text-white p-4 rounded-xl"
                    style={inputStyle('tamano')}
                    placeholder="Ej. 5x5 cm"
                    placeholderTextColor={COLORS.text.dimmed}
                    value={form.tamano}
                    onChangeText={(t) => { 
                      const formatted = t.replace(/[*_]/g, 'x').replace(/-/g, 'x');
                      setForm({ ...form, tamano: formatted }); 
                      setErrors(e => ({ ...e, tamano: false })); 
                    }}
                  />
                </Animated.View>
              </View>

              {/* Teléfono + Horas */}
              <View className="flex-row mb-4" style={{ gap: 12 }}>
                <Animated.View style={{ flex: 1, transform: [{ translateX: shakeAnims.telefono }] }}>
                  <Text className="text-[10px] mb-1.5 uppercase font-bold tracking-widest" style={labelStyle('telefono')}>Teléfono *</Text>
                  <TextInput
                    className="text-white p-4 rounded-xl"
                    style={inputStyle('telefono')}
                    keyboardType="phone-pad"
                    maxLength={15}
                    placeholder="Ej. +59171234567"
                    placeholderTextColor={COLORS.text.dimmed}
                    value={form.telefono}
                    onChangeText={(t) => { 
                      setForm({ ...form, telefono: t.replace(/[^0-9+]/g, '') }); 
                      setErrors(e => ({ ...e, telefono: false })); 
                    }}
                  />
                </Animated.View>
                <View style={{ flex: 1 }}>
                  <Text className="text-[10px] mb-1.5 uppercase font-bold tracking-widest" style={{ color: COLORS.text.muted }}>Horas *</Text>
                  <View className="flex-row justify-between items-center rounded-xl" style={{ backgroundColor: COLORS.dark[100], borderWidth: 1.5, borderColor: COLORS.dark[200], height: 52, paddingHorizontal: 10 }}>
                    <TouchableOpacity onPress={() => ajustarHoras(-1)} className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: COLORS.dark[200] }}>
                      <MaterialIcons name="remove" size={16} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">{form.horas}</Text>
                    <TouchableOpacity onPress={() => ajustarHoras(1)} className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: COLORS.primary.ghost }}>
                      <MaterialIcons name="add" size={16} color={COLORS.primary.DEFAULT} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Fecha */}
              <Text className="text-[10px] mb-1.5 uppercase font-bold tracking-widest" style={{ color: COLORS.text.muted }}>Fecha *</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row justify-between items-center p-4 rounded-xl mb-4"
                style={{ backgroundColor: COLORS.dark[100], borderWidth: 1.5, borderColor: COLORS.dark[200] }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <MaterialIcons name="calendar-today" size={18} color={COLORS.primary.DEFAULT} />
                  <Text className="text-white text-base">
                    {form.fecha.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <Text style={{ color: COLORS.primary.DEFAULT }} className="text-sm font-bold">Cambiar</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={form.fecha}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}

              {/* Horarios Disponibles */}
              <Animated.View style={{ transform: [{ translateX: shakeAnims.horario }] }}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[10px] uppercase font-bold tracking-widest" style={labelStyle('horario')}>
                    Horarios Disponibles *
                  </Text>
                  {!loadingHorarios && horarios.length > 0 && !form.horario && (
                    <Text style={{ color: COLORS.warning?.DEFAULT || COLORS.primary.DEFAULT }} className="text-[10px] font-bold">
                      ⬇ Selecciona un horario
                    </Text>
                  )}
                </View>
                {loadingHorarios ? (
                  <View className="items-center py-6 mb-4">
                    <ActivityIndicator color={COLORS.primary.DEFAULT} />
                    <Text style={{ color: COLORS.text.muted }} className="text-xs mt-2">Consultando horarios...</Text>
                  </View>
                ) : horarios.length === 0 ? (
                  <View className="items-center py-6 mb-4 rounded-xl" style={{ backgroundColor: COLORS.dark[100] }}>
                    <MaterialIcons name="event-busy" size={28} color={COLORS.danger.text} />
                    <Text style={{ color: COLORS.danger.text }} className="text-xs mt-2 font-semibold">
                      No hay horarios disponibles para esta fecha
                    </Text>
                    <Text style={{ color: COLORS.text.muted }} className="text-[10px] mt-1">
                      Intenta seleccionar otra fecha
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                    {horarios.map((h) => {
                      const selected = form.horario === h;
                      return (
                        <TouchableOpacity
                          key={h}
                          onPress={() => { setForm({ ...form, horario: h }); setErrors(e => ({ ...e, horario: false })); }}
                          activeOpacity={0.7}
                          className={`px-5 py-3 rounded-xl border-[1.5px] ${
                            selected ? 'bg-primary border-primary' : 'bg-dark-100 border-dark-200'
                          }`}
                        >
                          <Text className={`text-sm ${selected ? 'text-white font-bold' : 'text-text-secondary font-medium'}`}>
                            {h}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </Animated.View>

              {/* Cotización */}
              <Animated.View style={{ transform: [{ translateX: shakeAnims.cotizacion }] }}>
                <Text className="text-[10px] mb-1.5 uppercase font-bold tracking-widest" style={labelStyle('cotizacion')}>Cotización (Bs.) *</Text>
                <View className="flex-row items-center rounded-xl mb-6 overflow-hidden" style={inputStyle('cotizacion')}>
                  <View className="px-4 py-4" style={{ backgroundColor: COLORS.primary.ghost }}>
                    <Text className="text-base font-bold" style={{ color: COLORS.primary.DEFAULT }}>Bs.</Text>
                  </View>
                  <TextInput
                    className="flex-1 text-white p-4 text-base"
                    placeholder="0.00"
                    placeholderTextColor={COLORS.text.dimmed}
                    keyboardType="numeric"
                    value={form.cotizacion}
                    onChangeText={(t) => { setForm({ ...form, cotizacion: t }); setErrors(e => ({ ...e, cotizacion: false })); }}
                  />
                </View>
              </Animated.View>

              {/* Buttons */}
              <View className="flex-row gap-3 mb-10">
                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.7}
                  className="flex-1 p-4 rounded-2xl items-center"
                  style={{ borderWidth: 1.5, borderColor: COLORS.dark[300] }}
                >
                  <Text style={{ color: COLORS.text.secondary }} className="font-bold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCrear}
                  disabled={saving || loadingHorarios || !form.horario || horarios.length === 0}
                  activeOpacity={0.85}
                  className="flex-1 p-4 rounded-2xl items-center flex-row justify-center"
                  style={{
                    backgroundColor: (saving || loadingHorarios || !form.horario || horarios.length === 0)
                      ? COLORS.dark[300]
                      : COLORS.primary.DEFAULT,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color={COLORS.text.primary} size="small" />
                  ) : loadingHorarios ? (
                    <>
                      <ActivityIndicator color={COLORS.text.muted} size="small" style={{ marginRight: 6 }} />
                      <Text style={{ color: COLORS.text.muted }} className="font-bold">Cargando...</Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="check" size={18} color={COLORS.text.primary} style={{ marginRight: 6 }} />
                      <Text className="text-white font-bold">{form.horario ? 'Crear Cita' : 'Selecciona horario'}</Text>
                    </>
                  )}
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