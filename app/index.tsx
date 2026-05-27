import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore } from "@/src/store/useStudioStore";

export default function Index() {
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((s) => s.token);
  const studioToken = useStudioStore((s) => s.studioToken);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!studioToken) {
    return <Redirect href="/(studio)/select" />;
  }

  return <Redirect href="/(drawer)" />;
}
