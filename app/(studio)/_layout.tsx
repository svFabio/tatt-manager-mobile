import { Stack } from "expo-router";
import { COLORS } from "@/src/theme/colors";

export default function StudioLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.dark.DEFAULT },
      }}
    />
  );
}
