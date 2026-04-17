import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import RegistroCitaModal from "../../src/components/ui/RegistroCita"; // Asegúrate de que el nombre coincida

export default function CalendarScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="flex-1 bg-[#121212] items-center justify-center">
      {/* Contenido actual de tu calendario */}
      <Text className="text-white text-xl font-bold text-center">
        VISTA DE CALENDARIO
      </Text>

      {/* Botón flotante "+" para abrir HU-06 [cite: 420] */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          backgroundColor: '#a29bfe',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5
        }}
      >
        <Text style={{ fontSize: 30, color: '#000' }}>+</Text>
      </TouchableOpacity>

      {/* Modal de la HU-06 [cite: 416] */}
      <RegistroCitaModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
}