import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/src/store/useAuthStore'; 
import { useStudioStore } from '@/src/store/useStudioStore';
import { COLORS } from '@/src/theme/colors';
import api from '@/src/api/axios'; 
import { Text } from '@/src/components/StyledText';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { user, token, setAuth } = useAuthStore();
  const { currentStudio } = useStudioStore();

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true); 
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await api.get('/perfil');
        if (res.data.fotoUrl) {
          setImageUri(res.data.fotoUrl);
          if (user) {
            setAuth(token as string, { ...user, fotoUrl: res.data.fotoUrl });
          }
        }
      } catch (error) {
        console.error("Error cargando perfil", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, []);

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
      setImageFile(resultado.assets[0]);
    }
  };

  const manejarGuardar = async () => {
    setErrorNombre(null);

    if (!nombre || nombre.trim() === '') {
      setErrorNombre('El nombre es obligatorio.');
      return;
    }

    const regexAlfabetico = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regexAlfabetico.test(nombre)) {
      setErrorNombre('Ingrese solo caracteres alfabéticos.');
      return;
    }

    if (nombre.length < 3 || nombre.length > 50) {
      setErrorNombre('Mínimo 3, Máximo 50 caracteres.');
      return;
    }

    try {
      setGuardando(true);
      const formData = new FormData();
      formData.append("nombre", nombre.trim());
      
      if (imageFile) {
        const fileMatch = imageFile.uri.match(/\.([a-zA-Z0-9]+)$/);
        const fileType = fileMatch ? `image/${fileMatch[1]}` : `image/jpeg`;
        formData.append("foto", {
          uri: imageFile.uri,
          name: `perfil.${fileMatch ? fileMatch[1] : 'jpg'}`,
          type: fileType,
        } as any);
      }
      
      const response = await api.put('/perfil', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (user) {
        setAuth(token as string, { 
          ...user, 
          nombre: response.data.usuario.nombre,
          fotoUrl: response.data.usuario.fotoUrl || user.fotoUrl
        });
      }

      Alert.alert('Éxito', 'Perfil actualizado correctamente.'); 
      setImageFile(null); // Reset file so we don't reupload
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', error.response?.data?.error || 'Hubo un error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark px-6 pt-4">
      
      <Text className="text-white text-2xl font-bold mb-8">Editar Perfil</Text>

      <View className="self-center relative mb-10">
        {imageUri || user?.fotoUrl ? (
          <Image source={{ uri: imageUri || user?.fotoUrl }} className="w-28 h-28 rounded-full border-2" style={{ borderColor: COLORS.primary.DEFAULT }} />
        ) : (
          <View className="w-28 h-28 rounded-full border-2 bg-dark-100 justify-center items-center" style={{ borderColor: COLORS.primary.DEFAULT }}>
            <Ionicons name="person" size={50} color={COLORS.text.muted} />
          </View>
        )}
        
        <TouchableOpacity 
          className="absolute bottom-0 right-1 w-8 h-8 rounded-full justify-center items-center border-2 border-dark"
          style={{ backgroundColor: COLORS.primary.DEFAULT }}
          onPress={seleccionarImagen}
        >
          <Ionicons name="camera" size={14} color="white" />
        </TouchableOpacity>
      </View>

      <View className="mb-5">
        <Text className="text-gray-400 text-xs font-bold mb-2 tracking-widest">NOMBRE</Text>
        <TextInput
          className="bg-dark-100 text-white px-4 py-3 rounded-xl border"
          style={{ borderColor: errorNombre ? COLORS.danger.DEFAULT : COLORS.dark[200], fontFamily: 'Montserrat_400Regular' }}
          value={nombre}
          onChangeText={(text) => {
            setNombre(text);
            if (errorNombre) setErrorNombre(null);
          }}
          placeholder="Tu nombre completo"
          placeholderTextColor={COLORS.text.muted}
        />
        {errorNombre && <Text className="text-red-400 text-xs mt-1 font-medium">{errorNombre}</Text>}
      </View>

      <View className="mb-5">
        <Text className="text-gray-400 text-xs font-bold mb-2 tracking-widest">CORREO ELECTRÓNICO</Text>
        <View className="bg-dark-100 flex-row justify-between items-center px-4 py-3 rounded-xl border border-dark-200 opacity-60">
          <Text className="text-gray-400 font-medium">{user?.email}</Text>
          <Feather name="mail" size={16} color={COLORS.text.muted} />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 text-xs font-bold mb-2 tracking-widest">ROL EN EL ESTUDIO</Text>
        <View className="bg-dark-100 flex-row justify-between items-center px-4 py-3 rounded-xl border border-dark-200 opacity-60">
          <Text className="text-gray-400 font-medium">{currentStudio?.rol || "USUARIO"}</Text>
          <Feather name="lock" size={16} color={COLORS.text.muted} />
        </View>
      </View>

      <TouchableOpacity 
        className="py-4 rounded-xl items-center flex-row justify-center mb-10" 
        style={{ backgroundColor: COLORS.primary.DEFAULT }}
        onPress={manejarGuardar} 
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Feather name="save" size={18} color="white" />
            <Text className="text-white text-base font-bold ml-2">Guardar Cambios</Text>
          </>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}