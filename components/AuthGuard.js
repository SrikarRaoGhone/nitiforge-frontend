"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();

  const hasToken = useSyncExternalStore(
    () => () => {},
    () => Boolean(localStorage.getItem("token")),
    () => false,
  );

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login");
    }
  }, [hasToken, router]);

  if (!hasToken) {
    return null;
  }

  return children;
}
