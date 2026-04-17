import { Stack } from "expo-router";

export default function RequestsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#121212" } }}>
      <Stack.Screen name="solicitudes" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
