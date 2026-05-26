// app/(drawer)/whatsapp.tsx
import React, { useState, useEffect } from "react";
import { 
  ActivityIndicator, Alert, ScrollView, 
  KeyboardAvoidingView, Platform, View, TouchableOpacity, Text, StyleSheet
} from "react-native";
import { useRouter } from "expo-router"; // <-- 1. Importamos el enrutador
import { WhatsAppAPI } from "../../src/api/whatsapp";
import { useWhatsAppSocket } from "../../src/hooks/useWhatsAppSocket";
import { WhatsAppConnected } from "../../src/features/whatsapp/components/WhatsAppConnected";
import { WhatsAppLinker, ConnectionMethod } from "../../src/features/whatsapp/components/WhatsAppLinker";
import { COLORS } from "../../src/theme/colors";

export default function WhatsAppScreen() {
  const router = useRouter(); // <-- 2. Inicializamos el router
  const { wsState, loading, refreshStatus } = useWhatsAppSocket(1); 
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [method, setMethod] = useState<ConnectionMethod>("pair");
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-arranque si el servicio está caído
  useEffect(() => {
    if (!loading && !wsState.activo && !wsState.conectado) {
      handleStartBot();
    }
  }, [loading, wsState.activo, wsState.conectado]);

  const handleStartBot = async () => {
    setActionLoading(true);
    try {
      await WhatsAppAPI.startWhatsApp();
      await refreshStatus(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo iniciar el bot");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    setActionLoading(true);
    try {
      await WhatsAppAPI.logoutWhatsApp();
      setPairingCode(null);
      await refreshStatus(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo cerrar sesión");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestart = async () => {
    setActionLoading(true);
    try {
      await WhatsAppAPI.restartWhatsApp();
      setPairingCode(null);
      await refreshStatus(false);
    } catch (e) {
      // silencioso
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestPairing = async () => {
    if (phoneNumber.length < 7) {
      Alert.alert("Atención", "Inserta un número válido.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await WhatsAppAPI.requestPairingCode(phoneNumber);
      if (res.error) Alert.alert("Error", res.error);
      else if (res.codigo) setPairingCode(res.codigo);
    } catch (e) {
      Alert.alert("Error", "Fallo al solicitar código.");
    } finally {
      setActionLoading(false);
    }
  };

  const setMethodAndClean = (newMethod: ConnectionMethod) => {
    setMethod(newMethod);
    setPairingCode(null);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
      </View>
    );
  }

  // Si está conectado, renderizamos la UI verde de éxito + ACCESO AL HISTORIAL (HU-12)
  if (wsState.conectado) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212' }}>
        <View style={{ flex: 1 }}>
          <WhatsAppConnected 
            actionLoading={actionLoading}
            onLogout={handleLogout}
            onRestart={handleRestart}
          />
        </View>

        {/* BOTÓN AGREGADO PARA ACCEDER AL HISTORIAL DE CONVERSACIONES */}
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => router.push('/chat')} // Abre app/(drawer)/whatsapp/index.tsx
        >
          <Text style={styles.buttonText}>📂 Ver Historial de Chats</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // En caso contrario, el Linker (TABS y Código QR/Texto)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <WhatsAppLinker
          method={method}
          setMethod={setMethodAndClean}
          qrValor={wsState.qr}
          onRegenerate={handleRestart}
          pairingCode={pairingCode}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onRequestPairing={handleRequestPairing}
          onResetPairing={() => setPairingCode(null)}
          actionLoading={actionLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos agregados con colores oscuros/verdes para hacer match con tu app
const styles = StyleSheet.create({
  historyButton: {
    backgroundColor: '#25D366', // Verde oficial de WhatsApp
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});