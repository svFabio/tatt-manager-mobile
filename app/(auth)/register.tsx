import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Text, TextInput } from '@/src/components/StyledText';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CustomButton, InputField } from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore } from "@/src/store/useStudioStore";
import { COLORS } from "@/src/theme/colors";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // segundos

export default function RegisterScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // States
  const [email, setEmail]       = useState("");
  const [code, setCode]         = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [nombre, setNombre]     = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  
  // Timer states for resend
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resendDisabled, setResendDisabled] = useState(true);

  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const setAuth                 = useAuthStore((s) => s.setAuth);
  const clearStudio             = useStudioStore((s) => s.clearStudio);

  // ── Countdown para reenvío (Step 2) ──
  useEffect(() => {
    if (step === 2) {
      if (countdown <= 0) {
        setResendDisabled(false);
        return;
      }
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, step]);

  const formatCountdown = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const validarEmail = (correo: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  // ── Step 1: Solicitar código al email ──
  const handleSendCode = async () => {
    setError("");
    if (!email.trim()) { setError("Ingresa tu correo electrónico."); return; }
    if (!validarEmail(email.trim())) { setError("El correo ingresado no tiene un formato válido."); return; }

    try {
      setLoading(true);
      await api.post("/auth/register/send-code", { email: email.trim().toLowerCase() });
      setStep(2);
      setCountdown(RESEND_COOLDOWN);
      setResendDisabled(true);
      setCode(Array(CODE_LENGTH).fill(""));
    } catch (e: any) {
      setError(e.response?.data?.error || "Error al enviar código.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Manejar input de código ──
  const handleChangeText = (text: string, index: number) => {
    if (error) setError("");
    const digit = text.replace(/[^0-9]/g, "");
    const newCode = [...code];

    if (digit.length === CODE_LENGTH) {
      const digits = digit.split("");
      for (let i = 0; i < CODE_LENGTH; i++) {
        newCode[i] = digits[i] || "";
      }
      setCode(newCode);
      inputRefs.current[CODE_LENGTH - 1]?.focus();
      return;
    }

    newCode[index] = digit.slice(-1);
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── Step 2: Verificar código ──
  const handleVerifyCode = async () => {
    const fullCode = code.join("");
    if (fullCode.length < CODE_LENGTH) {
      setError("Ingresa el código completo de 6 dígitos.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/auth/register/verify-code", {
        email: email.trim().toLowerCase(),
        codigo: fullCode,
      });
      setStep(3);
    } catch (e: any) {
      setError(e.response?.data?.error || "Código inválido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Reenviar código ──
  const handleResend = async () => {
    if (resendDisabled) return;
    try {
      setResendDisabled(true);
      setCountdown(RESEND_COOLDOWN);
      setError("");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      await api.post("/auth/register/send-code", { email: email.trim().toLowerCase() });
    } catch (e: any) {
      const cooldown = e.response?.data?.cooldownRestante;
      if (cooldown) setCountdown(cooldown);
    }
  };

  // ── Step 3: Registrar cuenta final ──
  const handleRegister = async () => {
    if (!nombre.trim() || !password || !confirmPassword) { setError("Completa todos los campos."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/register", { 
        nombre: nombre.trim(), 
        email: email.trim().toLowerCase(), 
        password,
        codigo: code.join("")
      });
      
      setAuth(data.token, data.usuario);
      clearStudio(); 
      router.replace("/(studio)/select");
    } catch (e: any) {
      setError(e.response?.data?.error || "Error al crear cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark relative">
      {/* ── Background Glow ── */}
      <View className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary rounded-full opacity-10 blur-3xl" />
      <View className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-gold-dark rounded-full opacity-10 blur-3xl" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6 z-10"
      >
        <SafeAreaView className="flex-1 justify-center">
          
          {/* ── Botón Volver ── */}
          <TouchableOpacity
            onPress={() => step === 1 ? router.back() : setStep(step - 1 as 1 | 2)}
            className="absolute top-6 left-0 flex-row items-center z-20"
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.muted} />
            <Text className="text-text-muted text-sm ml-1">Volver</Text>
          </TouchableOpacity>

          {/* ── Titles ── */}
          <View className="items-center mb-8 mt-10">
            {step === 2 && (
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-primary/20">
                <Ionicons name="refresh-outline" size={32} color={COLORS.primary.DEFAULT} />
              </View>
            )}
            <Text className="text-white text-3xl font-bold text-center">
              {step === 1 && "Crea tu cuenta"}
              {step === 2 && "Verificar Código"}
              {step === 3 && "Completa tu perfil"}
            </Text>
            <Text className="text-muted text-center mt-2 px-2">
              {step === 1 && "Regístrate en el sistema, mediante el siguiente formulario."}
              {step === 2 && "Ingresa el código de 6 dígitos que enviamos a tu correo"}
              {step === 3 && "Crea una contraseña segura y cuéntanos cómo te llamas."}
            </Text>
            {step === 2 && <Text className="text-primary text-sm font-bold mt-1">{email}</Text>}
          </View>

          {/* ── STEP 1: Email Input ── */}
          {step === 1 && (
            <View>
              <InputField
                label="Correo Electrónico"
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => { setEmail(text); setError(""); }}
                error={error}
              />
              <Text className="text-muted-dark text-xs mb-6 mt-[-8px]">
                Se te enviará un código de verificación el cual debe ser llenado en el próximo paso.
              </Text>
              <CustomButton
                title={loading ? "Procesando..." : "SIGUIENTE"}
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleSendCode}
                disabled={loading}
              />
            </View>
          )}

          {/* ── STEP 2: Verify Code ── */}
          {step === 2 && (
            <View>
              <View className="flex-row justify-between mb-6 px-2">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <View
                    key={i}
                    className="rounded-xl border items-center justify-center bg-dark-200"
                    style={{
                      width: 48,
                      height: 56,
                      borderColor: code[i]
                        ? COLORS.primary.DEFAULT
                        : error
                          ? COLORS.danger.DEFAULT
                          : COLORS.dark[300],
                      borderWidth: code[i] ? 2 : 1,
                    }}
                  >
                    <TextInput
                      ref={(ref) => { inputRefs.current[i] = ref as unknown as RNTextInput; }}
                      className="text-white text-2xl font-bold text-center w-full h-full"
                      maxLength={i === 0 ? CODE_LENGTH : 1}
                      keyboardType="number-pad"
                      value={code[i]}
                      onChangeText={(text) => handleChangeText(text, i)}
                      onKeyPress={(e) => handleKeyPress(e, i)}
                      selectTextOnFocus
                    />
                  </View>
                ))}
              </View>

              {error ? <Text className="text-xs text-center mb-4 text-alert">{error}</Text> : null}

              <CustomButton
                title={loading ? "Verificando..." : "VERIFICAR"}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onPress={handleVerifyCode}
              />

              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-muted text-sm">¿No recibiste el código? </Text>
                {resendDisabled ? (
                  <Text className="text-muted-dark text-sm font-bold">
                    Reenviar en {formatCountdown(countdown)}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text className="text-primary text-sm font-bold">Reenviar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* ── STEP 3: Final Details ── */}
          {step === 3 && (
            <View>
              <InputField
                label="Nombre completo"
                placeholder="Ej. Juan Pérez"
                value={nombre}
                onChangeText={(t) => { setNombre(t); setError(""); }}
              />
              <InputField
                label="Contraseña"
                placeholder="••••••••"
                isPassword
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
              />
              <InputField
                label="Confirmar contraseña"
                placeholder="••••••••"
                isPassword
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(""); }}
                error={error}
              />

              <View className="mt-4">
                <CustomButton
                  title={loading ? "Creando..." : "REGISTRARSE"}
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleRegister}
                  disabled={loading}
                />
              </View>
            </View>
          )}

          {/* ── Link volver a login (solo visible en el paso 1) ── */}
          {step === 1 && (
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-muted">¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-primary font-bold">Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          )}

        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
