"use client";

import { useRouter } from "next/navigation";
import SplashScreen from "@/components/SplashScreen";

export default function SplashPage() {
  const router = useRouter();

  return (
    <SplashScreen
      onFinish={() => {
        router.replace("/");
      }}
    />
  );
}