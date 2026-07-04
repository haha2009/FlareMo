import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/api";
import { useI18n } from "@/i18n";

export function ChangePasswordForm() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      changePassword(input),
    onSuccess: () => {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      queryClient.invalidateQueries();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : t("auth.changePasswordFailed");
      setError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!currentPassword || !newPassword) {
      setError(t("auth.currentPasswordRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsMustMatch"));
      return;
    }
    mutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="flex h-svh items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-xl border bg-card p-6 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-bold">{t("auth.changePassword")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Change your access password
          </p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {t("auth.changePasswordSuccess")}
          </p>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="current">
            {t("auth.currentPassword")}
          </label>
          <Input
            id="current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="new">
            {t("auth.newPassword")}
          </label>
          <Input
            id="new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirm">
            {t("auth.confirmNewPassword")}
          </label>
          <Input
            id="confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? t("common.loading") : t("auth.changePassword")}
        </Button>
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
