import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error?.message || t("login.invalidCredentials"));
        return;
      }
      onLogin();
    } catch {
      setError(t("login.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-svh items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">FlareMo</h1>
          <p className="mt-2 text-muted-foreground">{t("login.title")}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            {t("login.password")}
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.passwordPlaceholder")}
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("login.loading") : t("login.submit")}
        </Button>
      </form>
    </div>
  );
}
