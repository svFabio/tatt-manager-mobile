import { Stack } from "expo-router";
import { COLORS } from "@/src/theme/colors";

export default function RequestsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.dark.DEFAULT } }}>
      <Stack.Screen name="solicitudes" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
