import { Stack } from "expo-router";

export default function RequestsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#121212" } }}>
      <Stack.Screen name="index" />
      {/* Futuras pantallas hijas como "detalle de solicitud" irán aquí */}
    </Stack>
  );
}
