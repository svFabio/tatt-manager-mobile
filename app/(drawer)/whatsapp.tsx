import React, { useState, useEffect } from "react";
import { 
  ActivityIndicator, Alert, ScrollView, 
  KeyboardAvoidingView, Platform, View
} from "react-native";
import { WhatsAppAPI } from "../../src/api/whatsapp";
import { useWhatsAppSocket } from "../../src/hooks/useWhatsAppSocket";
import { WhatsAppConnected } from "../../src/features/whatsapp/components/WhatsAppConnected";
import { WhatsAppLinker, ConnectionMethod } from "../../src/features/whatsapp/components/WhatsAppLinker";

export default function WhatsAppScreen() {
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
      await refreshStatus();
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
      await refreshStatus();
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
      await refreshStatus();
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
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  // Si está conectado, renderizamos la UI verde de éxito
  if (wsState.conectado) {
    return (
      <WhatsAppConnected 
        actionLoading={actionLoading}
        onLogout={handleLogout}
        onRestart={handleRestart}
      />
    );
  }

  // En caso contrario, el Linker (TABS y Código QR/Texto)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-[#121212]">
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
