import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";
import { CustomButton } from "@/src/components/ui";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "¡Oops!" }} />
      <View className="flex-1 bg-dark items-center justify-center px-6">
        <Text className="text-gold text-6xl mb-4">404</Text>
        <Text className="text-white text-xl font-bold mb-2">
          Pantalla no encontrada
        </Text>
        <Text className="text-muted text-sm text-center mb-8">
          La ruta que buscas no existe en la aplicación.
        </Text>
        <Link href="/" asChild>
          <CustomButton title="Ir al Inicio" variant="primary" />
        </Link>
      </View>
    </>
  );
}
