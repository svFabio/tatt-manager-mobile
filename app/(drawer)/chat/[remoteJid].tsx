// app/(drawer)/chat/[remoteJid].tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import ChatHistory from '../../../src/features/whatsapp/components/ChatHistory';

export default function ChatIndividualScreen() {
  const { remoteJid, nombre } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Actualiza dinámicamente el Header superior con el nombre del cliente */}
      <Stack.Screen options={{ title: nombre ? String(nombre) : 'Chat de WhatsApp', headerShown: true }} />
      <ChatHistory remoteJid={String(remoteJid)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5ddd5' } // Fondo beige clásico
});