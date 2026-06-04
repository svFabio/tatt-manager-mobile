import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput as RNTextInput } from "react-native";
import { Text } from "@/src/components/StyledText";
import { TextInput } from "@/src/components/StyledText";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CustomButton, InputField } from "@/src/components/ui";
import api from "@/src/api/axios";
import { COLORS } from "@/src/theme/colors";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore } from "@/src/store/useStudioStore";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // segundos

export default function VerifyCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [step, setStep] = useState<1 | 2>(1);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resendDisabled, setResendDisabled] = useState(true);

  const [tempToken, setTempToken] = useState("");
  const [tempUser, setTempUser] = useState<any>(null);

  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearStudio = useStudioStore((s) => s.clearStudio);

  // ── Countdown para reenvío ──
  useEffect(() => {
    if (step === 1) {
      if (countdown <= 0) {
        setResendDisabled(false);
        return;
      }
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, step]);

  // ── Formatear countdown como mm:ss ──
  const formatCountdown = useCallback((seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  // ── Manejar input de cada dígito ──
  const handleChangeText = (text: string, index: number) => {
    if (error) setError("");

    // Solo aceptar dígitos
    const digit = text.replace(/[^0-9]/g, "");
    
    const newCode = [...code];

    if (digit.length === CODE_LENGTH) {
      // Pegar código completo
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

    // Auto-avanzar al siguiente input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Manejar tecla backspace ──
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── Verificar código ──
  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < CODE_LENGTH) {
      setError("Ingresa el código completo de 6 dígitos.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/recovery/verify", {
        email,
        codigo: fullCode,
      });

      setTempToken(data.token);
      setTempUser(data.usuario);
      setStep(2);
    } catch (e: any) {
      setError(e.response?.data?.error || "Código inválido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Reenviar código ──
  const handleResend = async () => {
    if (resendDisabled) return;

    try {
      setResendDisabled(true);
      setCountdown(RESEND_COOLDOWN);
      setError("");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();

      await api.post("/recovery/resend", { email });
    } catch (e: any) {
      const cooldown = e.response?.data?.cooldownRestante;
      if (cooldown) {
        setCountdown(cooldown);
      }
    }
  };

  // ── Actualizar contraseña ──
  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      setError("Completa todos los campos.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await api.put("/perfil/password", { password }, {
        headers: { Authorization: `Bearer ${tempToken}` }
      });

      // Autenticar y redirigir al home
      setAuth(tempToken, tempUser);
      clearStudio();
      router.replace("/(studio)/select");
    } catch (e: any) {
      setError(e.response?.data?.error || "Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  // ── Email censurado para mostrar ──
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "•".repeat(Math.min(b.length, 6)) + c)
    : "";

  return (
    <View className="flex-1 bg-dark relative">
      {/* ── Background Glow ── */}
      <View className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary rounded-full opacity-10 blur-3xl" />
      <View className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-gold-dark rounded-full opacity-10 blur-3xl" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6 z-10"
      >
        <View className="flex-1 justify-center">
          {/* ── Botón Volver ── */}
          <TouchableOpacity
            onPress={() => step === 1 ? router.back() : setStep(1)}
            className="absolute top-16 left-0 flex-row items-center z-20"
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.muted} />
            <Text className="text-text-muted text-sm ml-1">Volver</Text>
          </TouchableOpacity>

          {/* ── Icono + Título ── */}
          <View className="items-center mb-10">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: COLORS.primary.ghost }}
            >
              <Ionicons name={step === 1 ? "shield-checkmark-outline" : "key-outline"} size={36} color={COLORS.primary.DEFAULT} />
            </View>
            <Text
              className="text-text-primary text-3xl font-black tracking-tight text-center"
              style={{ fontFamily: "Montserrat_900Black" }}
            >
              {step === 1 ? "Verificar\nCódigo" : "Nueva\nContraseña"}
            </Text>
            <Text className="text-text-muted text-sm mt-4 text-center font-medium leading-5 px-4">
              {step === 1 ? "Ingresa el código de 6 dígitos que enviamos a" : "Crea una nueva contraseña segura para tu cuenta."}
            </Text>
            {step === 1 && <Text className="text-primary text-sm font-bold mt-1">{maskedEmail}</Text>}
          </View>

          {step === 1 && (
            <View>
              {/* ── Inputs de código ── */}
              <View className="flex-row justify-between mb-6 px-2">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <View
                    key={i}
                    className="rounded-2xl border items-center justify-center"
                    style={{
                      width: 50,
                      height: 60,
                      backgroundColor: COLORS.dark[200],
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
                      className="text-text-primary text-2xl font-bold text-center"
                      style={{ width: "100%", height: "100%", textAlign: "center" }}
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

              {/* ── Error ── */}
              {error ? (
                <View className="mb-4 px-2">
                  <Text className="text-xs text-center" style={{ color: COLORS.danger.text }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* ── Botón Verificar ── */}
              <View className="mt-2">
                <CustomButton
                  title={loading ? "Verificando..." : "VERIFICAR"}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  onPress={handleVerify}
                />
              </View>

              {/* ── Reenviar ── */}
              <View className="flex-row justify-center items-center mt-8">
                <Text className="text-text-muted text-sm">¿No recibiste el código? </Text>
                {resendDisabled ? (
                  <Text className="text-text-dimmed text-sm font-bold">
                    REENVIAR en {formatCountdown(countdown)}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text className="text-primary text-sm font-bold">REENVIAR</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <InputField
                label="Nueva contraseña"
                placeholder="••••••••"
                isPassword
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
              />
              <InputField
                label="Confirmar nueva contraseña"
                placeholder="••••••••"
                isPassword
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(""); }}
                error={error}
              />

              <View className="mt-4">
                <CustomButton
                  title={loading ? "Actualizando..." : "CAMBIAR CONTRASEÑA"}
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleUpdatePassword}
                  disabled={loading}
                />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
