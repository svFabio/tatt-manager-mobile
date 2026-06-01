import React from "react";
import { Drawer } from "expo-router/drawer";
import { BlurView } from "expo-blur";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FontAwesome, Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, Alert, Image, InteractionManager } from "react-native";
import { Text } from "@/src/components/StyledText";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/src/theme/colors";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore } from "@/src/store/useStudioStore";

function CustomDrawerContent(props: any) {
  const { state } = props;
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const currentStudio = useStudioStore((state) => state.currentStudio);
  const clearStudio = useStudioStore((state) => state.clearStudio);

  const handleNavigation = (path: any) => {
    // La máxima optimización para React Native:
    // Obliga a que la animación de cierre del Drawer termine al 100% (a 60fps)
    // ANTES de siquiera empezar a procesar la siguiente pantalla.
    requestAnimationFrame(() => {
      InteractionManager.runAfterInteractions(() => {
        router.push(path);
      });
    });
  };

  // 🛡️ DECLARACIÓN ÚNICA Y LIMPIA:
  const currentRouteName = state ? state.routes[state.index].name : "";
  
  const isRouteActive = (name: string) => {
    if (name === "estadisticas" && currentRouteName === "estadisticas/index") return true;
    return currentRouteName === name;
  };

  const getBtnStyle = (name: string) => `flex-row items-center px-3 py-3 rounded-xl ${isRouteActive(name) ? "bg-dark-100" : ""}`;
  const getTextColor = (name: string) => isRouteActive(name) ? "text-text-primary" : "text-text-secondary";
  const getIconColor = (name: string) => isRouteActive(name) ? COLORS.primary.DEFAULT : COLORS.text.secondary;

  const handleExitStudio = () => {
    Alert.alert(
      "Salir del Estudio",
      "¿Seguro que deseas salir y regresar a la selección de espacios de trabajo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive",
          onPress: () => {
            clearStudio();
            router.replace("/(studio)/select" as any);
          }
        }
      ]
    );
  };

  const isAdmin = currentStudio?.rol === "ADMIN";

  return (
    <BlurView intensity={45} tint="dark" experimentalBlurMethod="dimezisBlurView" style={{ flex: 1, borderTopRightRadius: 32, borderBottomRightRadius: 32, borderRightWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.15)' }} edges={["top", "bottom"]}>
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingVertical: 24 }}>
        
        {/* Cabecera del Usuario */}
        <TouchableOpacity onPress={() => router.push("/(drawer)/perfil" as any)} className="px-6 mb-8 items-center flex-row" activeOpacity={0.7}>
          <View className="w-16 h-16 rounded-2xl items-center justify-center overflow-hidden border border-dark-300">
            {user?.fotoUrl ? (
              <Image source={{ uri: user.fotoUrl }} className="w-full h-full" />
            ) : (
              <FontAwesome name="user" size={32} color={COLORS.text.muted} />
            )}
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">{user?.nombre || "Usuario"}</Text>
            <Text className="text-text-muted text-xs mt-1" numberOfLines={1}>{currentStudio?.nombre}</Text>
          </View>
        </TouchableOpacity>

        {/* ── MENÚ PRINCIPAL ── */}
        <Text className="text-xs font-bold tracking-widest px-6 mb-3 mt-4 text-text-muted">
          MENU PRINCIPAL
        </Text>
        <View className="px-3 gap-y-1">
          <TouchableOpacity onPress={() => handleNavigation("/(drawer)" as any)} className={getBtnStyle("index")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Ionicons name="home" size={20} color={getIconColor("index")} /></View>
            <Text className={`font-semibold ml-3 text-base ${getTextColor("index")}`}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigation("/(drawer)/calendar" as any)} className={getBtnStyle("calendar")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="calendar" size={20} color={getIconColor("calendar")} /></View>
            <Text className={`font-semibold ml-3 text-base ${getTextColor("calendar")}`}>Calendario</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigation("/(drawer)/requests" as any)} className={getBtnStyle("requests")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="user-plus" size={20} color={getIconColor("requests")} /></View>
            <Text className={`font-semibold ml-3 text-base ${getTextColor("requests")}`}>Solicitudes</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigation("/(drawer)/end-session" as any)} className={getBtnStyle("end-session")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="log-out" size={20} color={getIconColor("end-session")} /></View>
            <Text className={`font-semibold ml-3 text-base ${getTextColor("end-session")}`}>Finalizar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigation("/(drawer)/chat" as any)} className={getBtnStyle("chat")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Ionicons name="chatbubble-outline" size={20} color={getIconColor("chat")} /></View>
            <Text className={`font-semibold ml-3 text-base ${getTextColor("chat")}`}>Chat WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* ── ADMINISTRACIÓN ── */}
        {isAdmin && (
          <>
            <Text className="text-xs font-bold tracking-widest px-6 mb-3 mt-8 text-text-muted">
              ADMINISTRACIÓN
            </Text>
            <View className="px-3 gap-y-1">
              <TouchableOpacity onPress={() => handleNavigation("/(drawer)/whatsapp" as any)} className={getBtnStyle("whatsapp")} activeOpacity={0.7}>
                <View className="w-8 items-center justify-center"><Feather name="link" size={20} color={getIconColor("whatsapp")} /></View>
                <Text className={`font-semibold ml-3 text-base ${getTextColor("whatsapp")}`}>Vincular WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => handleNavigation("/(drawer)/users" as any)} className={getBtnStyle("users")} activeOpacity={0.7}>
                <View className="w-8 items-center justify-center"><Feather name="users" size={20} color={getIconColor("users")} /></View>
                <Text className={`font-semibold ml-3 text-base ${getTextColor("users")}`}>Usuarios</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleNavigation("/(drawer)/estadisticas" as any)} className={getBtnStyle("estadisticas")} activeOpacity={0.7}>
                <View className="w-8 items-center justify-center"><Feather name="activity" size={20} color={getIconColor("estadisticas")} /></View>
                <Text className={`font-semibold ml-3 text-base ${getTextColor("estadisticas")}`}>Estadísticas</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleNavigation("/(drawer)/inventory" as any)} className={getBtnStyle("inventory")} activeOpacity={0.7}>
                <View className="w-8 items-center justify-center"><Feather name="archive" size={20} color={getIconColor("inventory")} /></View>
                <Text className={`font-semibold ml-3 text-base ${getTextColor("inventory")}`}>Inventario</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleNavigation("/(drawer)/sessions" as any)} className={getBtnStyle("sessions")} activeOpacity={0.7}>
                <View className="w-8 items-center justify-center"><MaterialIcons name="history" size={22} color={getIconColor("sessions")} /></View>
                <Text className={`font-semibold ml-3 text-base ${getTextColor("sessions")}`}>Historial de sesiones</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleNavigation("/(drawer)/settings" as any)} className={getBtnStyle("settings")} activeOpacity={0.7}>
                <View className="w-8 items-center justify-center"><Feather name="settings" size={20} color={getIconColor("settings")} /></View>
                <Text className={`font-semibold ml-3 text-base ${getTextColor("settings")}`}>Configuración</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View className="px-3 mt-10 mb-6">
           <TouchableOpacity onPress={handleExitStudio} className="flex-row items-center px-3 py-3 rounded-xl" activeOpacity={0.7}>
             <View className="w-8 items-center justify-center"><Feather name="arrow-left-circle" size={20} color={COLORS.danger.text} /></View>
             <View><Text className="font-semibold ml-3 text-base text-danger-text">Salir del estudio</Text></View>
           </TouchableOpacity>
        </View>

        <View className="h-12" />
      </DrawerContentScrollView>
      </SafeAreaView>
    </BlurView>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.dark.DEFAULT, borderBottomWidth: 0, shadowOpacity: 0, elevation: 0 },
          headerTintColor: COLORS.primary.DEFAULT,
          headerTitleStyle: { fontFamily: "Montserrat_700Bold", color: COLORS.text.primary },
          drawerStyle: { 
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            borderRightWidth: 0,
            width: 280,
            borderTopRightRadius: 32,
            borderBottomRightRadius: 32,
            overflow: 'hidden'
          },
          drawerType: 'slide',
          overlayColor: 'rgba(0,0,0,0.15)',
          sceneContainerStyle: { backgroundColor: COLORS.dark.DEFAULT },
        }}
      >
        <Drawer.Screen name="index" options={{ title: "Inicio", headerShown: true }} />
        <Drawer.Screen name="perfil" options={{ title: "Editar Perfil", headerShown: true }} />
        <Drawer.Screen name="calendar" options={{ title: "Calendario", headerShown: true }} />
        <Drawer.Screen name="requests" options={{ title: "Solicitudes", headerShown: true }} />
        <Drawer.Screen name="chat" options={{ title: "Chat WhatsApp", headerShown: true }} />
        <Drawer.Screen name="end-session" options={{ title: "Terminar Sesión", headerShown: true }} />
        <Drawer.Screen name="whatsapp" options={{ title: "Vincular WhatsApp", headerShown: true }} />
        <Drawer.Screen name="users" options={{ title: "Usuarios", headerShown: true }} />
        <Drawer.Screen name="estadisticas" options={{ title: "Estadísticas del Estudio", headerShown: true }} />
        <Drawer.Screen name="inventory" options={{ title: "Inventario", headerShown: true }} />
        <Drawer.Screen name="sessions" options={{ title: "Historial de Sesiones", headerShown: true }} />
        <Drawer.Screen name="agenda" options={{ title: "Agenda", headerShown: true }} />
        <Drawer.Screen name="reports" options={{ title: "Reportes", headerShown: true }} />
        <Drawer.Screen name="settings" options={{ title: "Configuración", headerShown: true }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}