import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/src/store/useAuthStore'; 
import api from '@/src/api/axios'; 

const PALETA = {
  moradoPrincipal: '#800080',
  fondoOscuro: '#121212',
  tarjetaGris: '#1E1E1E',
  blanco: '#FFFFFF',
  textoGris: '#A0A0A0',
  bordeSuave: '#2A2A2A',
  errorRojo: '#FF4444',
};

export default function EditarPerfilScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  // 1. Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState(''); 
  const [rol, setRol] = useState('ADMINISTRADOR'); 
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // 2. Estados de control
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true); 
  const [guardando, setGuardando] = useState(false);

  // ── 🔄 CARGA REAL DESDE EL BACKEND (GET) ──
  useEffect(() => {
    const obtenerDatosPerfil = async () => {
      // Si el token aún no se ha cargado de Zustand, esperamos sin romper el flujo
      if (!token) {
        console.log('⚠️ [Perfil] Esperando token de autenticación o token ausente en Zustand.');
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        console.log('📡 [Perfil] Solicitando datos al backend con Axios...');
        
        // El interceptor añadirá automáticamente el "Bearer token" aquí
        const response = await api.get('/perfil');
        const datos = response.data;

        console.log('✅ [Perfil] Datos recibidos con éxito desde el backend:', datos);

        // Seteamos los estados con la respuesta limpia del backend
        setNombre(datos.nombre || '');
        setEmail(datos.email || ''); 
        setRol(datos.rol || '');

      } catch (error: any) {
        console.error('❌ [Perfil] Error detallado al obtener datos:', error);
        
        if (error.response) {
          console.log('📦 [Perfil] Datos del error del servidor:', error.response.data);
          Alert.alert('Error de Autenticación', error.response.data.error || 'Sesión inválida.');
        } else {
          Alert.alert('Error de Red', 'No se pudo conectar con el servidor backend.');
        }
      } finally {
        setCargando(false);
      }
    };

    obtenerDatosPerfil();
  }, [token]); // Reacciona de inmediato cuando el token pase de null a tener el string de sesión

  // 📸 Selector de imágenes (Criterio del lápiz)
  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      setImageUri(resultado.assets[0].uri);
    }
  };

  // ── 💾 GUARDADO REAL EN EL BACKEND (PUT) ──
  const manejarGuardar = async () => {
    setErrorNombre(null);

    // Validación 1: Vacío o solo espacios en blanco
    if (!nombre || nombre.trim() === '') {
      setErrorNombre('El nombre es obligatorio.');
      return;
    }

    // Validación 2: Solo letras y espacios (caracteres alfabéticos)
    const regexAlfabetico = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regexAlfabetico.test(nombre)) {
      setErrorNombre('Ingrese solo caracteres alfabéticos.');
      return;
    }

    // Validación 3: Longitud mínima 3 y máxima 50
    if (nombre.length < 3 || nombre.length > 50) {
      setErrorNombre('Min 3, Max 50 caracteres.');
      return;
    }

    try {
      setGuardando(true);
      console.log('💾 [Perfil] Enviando actualización de nombre:', nombre.trim());
      
      // Enviamos el objeto con el nombre hacia el endpoint PUT /perfil
      const response = await api.put('/perfil', { nombre: nombre.trim() });
      console.log('✅ [Perfil] Actualización exitosa:', response.data);

      Alert.alert('Éxito', 'Perfil actualizado correctamente.'); 
    } catch (error: any) {
      console.error('❌ [Perfil] Error al actualizar perfil:', error);
      const mensajeError = error.response?.data?.error || 'Hubo un error al guardar los cambios.';
      Alert.alert('Error', mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  // Spinner de carga inicial para evitar que parpadee el formulario vacío
  if (cargando) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={PALETA.moradoPrincipal} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* ⬅️ Flecha de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={PALETA.blanco} />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.mainTitle}>Editar Perfil</Text>

      {/* 🖼️ Componente de Imagen / Avatar */}
      <View style={styles.avatarContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarImage, styles.avatarGenerico]}>
            <Ionicons name="person" size={55} color={PALETA.textoGris} />
          </View>
        )}
        
        {/* Ícono de lápiz */}
        <TouchableOpacity style={styles.editIconBadge} onPress={seleccionarImagen}>
          <Ionicons name="pencil" size={14} color={PALETA.blanco} />
        </TouchableOpacity>
      </View>

      {/* 📝 Entrada de Nombre (Editable) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>NOMBRE</Text>
        <TextInput
          style={[styles.input, errorNombre ? styles.inputErrorBorder : null]}
          value={nombre}
          onChangeText={(text) => {
            setNombre(text);
            if (errorNombre) setErrorNombre(null);
          }}
          placeholder="Tu nombre completo"
          placeholderTextColor={PALETA.textoGris}
        />
        {errorNombre && <Text style={styles.errorText}>{errorNombre}</Text>}
      </View>

      {/* 📬 Entrada de Correo (Informativo / Bloqueado) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
        <View style={[styles.input, styles.inputDisabled]}>
          <Text style={styles.disabledText}>{email || 'Cargando correo...'}</Text>
          <Ionicons name="mail" size={15} color={PALETA.textoGris} style={styles.lockIcon} />
        </View>
      </View>

      {/* 🔒 Entrada de Rol (Informativo / Bloqueado) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>ROL EN EL ESTUDIO</Text>
        <View style={[styles.input, styles.inputDisabled]}>
          <Text style={styles.disabledText}>{rol}</Text>
          <Ionicons name="lock-closed" size={15} color={PALETA.textoGris} style={styles.lockIcon} />
        </View>
      </View>

      {/* 🔘 Botón Guardar */}
      <TouchableOpacity style={styles.saveButton} onPress={manejarGuardar} disabled={guardando}>
        {guardando ? (
          <ActivityIndicator color={PALETA.blanco} />
        ) : (
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETA.fondoOscuro },
  centerContainer: { justifyContent: 'center', alignItems: 'center' },
  contentContainer: { padding: 20, paddingTop: 10, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backText: { color: PALETA.blanco, marginLeft: 8, fontSize: 15 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: PALETA.blanco, marginBottom: 30 },
  avatarContainer: { alignSelf: 'center', position: 'relative', marginBottom: 35 },
  avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: PALETA.moradoPrincipal },
  avatarGenerico: { backgroundColor: PALETA.tarjetaGris, justifyContent: 'center', alignItems: 'center' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 2, backgroundColor: PALETA.moradoPrincipal, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: PALETA.fondoOscuro },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: 'bold', color: PALETA.textoGris, marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: PALETA.tarjetaGris, color: PALETA.blanco, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: PALETA.bordeSuave, fontSize: 14 },
  inputErrorBorder: { borderColor: PALETA.errorRojo },
  inputDisabled: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', opacity: 0.55 },
  disabledText: { color: PALETA.textoGris, fontSize: 14 },
  lockIcon: { marginRight: 2 },
  errorText: { color: PALETA.errorRojo, fontSize: 11, marginTop: 5, fontWeight: '500' },
  saveButton: { backgroundColor: PALETA.moradoPrincipal, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  saveButtonText: { color: PALETA.blanco, fontSize: 15, fontWeight: 'bold' },
});