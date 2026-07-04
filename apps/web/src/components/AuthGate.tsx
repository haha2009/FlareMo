import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { checkAuthStatus } from "@/api";
import { LoginPage } from "@/pages/login-page";

export function AuthGate({ children }: { children: ReactNode }) {
  const statusQuery = useQuery({
    queryKey: ["auth", "status"],
    queryFn: checkAuthStatus,
    retry: false,
  });

  if (statusQuery.isLoading) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!statusQuery.data?.authenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
