import React from "react";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FontAwesome, Feather, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { COLORS } from "@/src/theme/colors";

function CustomDrawerContent(props: any) {
  const { navigation, state } = props;
  const router = useRouter();

  // React Navigation inyecta el estado directamente en el componente Drawer.
  // Esta es la forma 100% nativa y segura de saber qué ruta está activa.
  const currentRouteName = state ? state.routes[state.index].name : "";

  const isRouteActive = (name: string) => currentRouteName === name;

  const getBtnStyle = (name: string) => `flex-row items-center px-3 py-3 rounded-xl ${isRouteActive(name) ? "bg-dark-100" : ""}`;
  const getTextStyle = (name: string) => isRouteActive(name) ? "text-white font-semibold ml-3 text-base" : "text-gray-400 font-medium ml-3 text-base";
  const getIconColor = (name: string) => isRouteActive(name) ? COLORS.primary.DEFAULT : "#9CA3AF";

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top", "bottom"]}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingVertical: 24 }}>
        
        {/* Cabecera del Usuario */}
        <View className="px-6 mb-8 items-center flex-row">
          <View className="w-16 h-16 rounded-2xl border border-gray-600 items-center justify-center">
            <FontAwesome name="user" size={32} color="#6B7280" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-white text-2xl font-bold">Arturo</Text>
          </View>
        </View>

        {/* ── MENÚ PRINCIPAL ── */}
        <Text className="text-gray-500 text-xs font-bold tracking-widest px-6 mb-3 mt-4">
          MENU PRINCIPAL
        </Text>
        <View className="px-3 gap-y-1">
          <TouchableOpacity onPress={() => router.push("/(drawer)" as any)} className={getBtnStyle("index")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Ionicons name="home" size={20} color={getIconColor("index")} /></View>
            <Text className={getTextStyle("index")}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/calendar" as any)} className={getBtnStyle("calendar")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="calendar" size={20} color={getIconColor("calendar")} /></View>
            <Text className={getTextStyle("calendar")}>Calendario</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/requests" as any)} className={getBtnStyle("requests")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="user-plus" size={20} color={getIconColor("requests")} /></View>
            <Text className={getTextStyle("requests")}>Solicitudes</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/end-session" as any)} className={getBtnStyle("end-session")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="log-out" size={20} color={getIconColor("end-session")} /></View>
            <Text className={getTextStyle("end-session")}>Finalizar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/whatsapp" as any)} className={getBtnStyle("whatsapp")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="link" size={20} color={getIconColor("whatsapp")} /></View>
            <Text className={getTextStyle("whatsapp")}>Vincular WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/chat" as any)} className={getBtnStyle("chat")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Ionicons name="chatbubble-outline" size={20} color={getIconColor("chat")} /></View>
            <Text className={getTextStyle("chat")}>Chat WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* ── ADMINISTRACIÓN ── */}
        <Text className="text-gray-500 text-xs font-bold tracking-widest px-6 mb-3 mt-8">
          ADMINISTRACIÓN
        </Text>
        <View className="px-3 gap-y-1">
          <TouchableOpacity onPress={() => router.push("/(drawer)/users" as any)} className={getBtnStyle("users")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="users" size={20} color={getIconColor("users")} /></View>
            <Text className={getTextStyle("users")}>Usuarios</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/stats" as any)} className={getBtnStyle("stats")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="activity" size={20} color={getIconColor("stats")} /></View>
            <Text className={getTextStyle("stats")}>Estadisticas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/inventory" as any)} className={getBtnStyle("inventory")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><Feather name="archive" size={20} color={getIconColor("inventory")} /></View>
            <Text className={getTextStyle("inventory")}>Inventario</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(drawer)/sessions" as any)} className={getBtnStyle("sessions")} activeOpacity={0.7}>
            <View className="w-8 items-center justify-center"><MaterialIcons name="history" size={22} color={getIconColor("sessions")} /></View>
            <Text className={getTextStyle("sessions")}>Historial de sesiones</Text>
          </TouchableOpacity>
        </View>

        <View className="h-12" />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: "#121212", borderBottomWidth: 0, shadowOpacity: 0, elevation: 0 },
          headerTintColor: COLORS.primary.DEFAULT,
          headerTitleStyle: { fontWeight: "bold", color: "#FFFFFF" },
        }}
      >
        <Drawer.Screen name="index" options={{ title: "Inicio", headerShown: true }} />
        <Drawer.Screen name="calendar" options={{ title: "Calendario", headerShown: true }} />
        <Drawer.Screen name="requests" options={{ title: "Solicitudes", headerShown: true }} />
        <Drawer.Screen name="whatsapp" options={{ title: "Vincular WhatsApp", headerShown: true }} />
        <Drawer.Screen name="chat" options={{ title: "Chat WhatsApp", headerShown: true }} />
        <Drawer.Screen name="end-session" options={{ title: "Terminar Sesión", headerShown: true }} />
        
        {/* Placeholder routes added silently */}
        <Drawer.Screen name="users" options={{ title: "Usuarios", headerShown: true }} />
        <Drawer.Screen name="stats" options={{ title: "Estadisticas", headerShown: true }} />
        <Drawer.Screen name="inventory" options={{ title: "Inventario", headerShown: true }} />
        <Drawer.Screen name="sessions" options={{ title: "Historial de Sesiones", headerShown: true }} />
        
        {/* Futuras u ocultas */}
        <Drawer.Screen name="agenda" options={{ title: "Agenda", headerShown: true }} />
        <Drawer.Screen name="reports" options={{ title: "Reportes", headerShown: true }} />
        <Drawer.Screen name="settings" options={{ title: "Configuración", headerShown: true }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
