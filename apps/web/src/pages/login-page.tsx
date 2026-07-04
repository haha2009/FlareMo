import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AuthViews from "@/components/AuthViews";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import {
  checkAuthStatus,
  login,
  changePassword,
  register,
  getPasswordHint,
} from "@/api";
import { useI18n } from "@/i18n";

const EMPTY_LOGIN = { email: "", password: "" };
const EMPTY_REGISTER = {
  name: "",
  email: "",
  password: "",
  password2: "",
  passwordHint: "",
  inviteCode: "",
};

export function LoginPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"login" | "register" | "locked">("login");
  const [loginValues, setLoginValues] = useState(EMPTY_LOGIN);
  const [registerValues, setRegisterValues] = useState(EMPTY_REGISTER);
  const [hintLoading, setHintLoading] = useState(false);

  const statusQuery = useQuery({
    queryKey: ["auth", "status"],
    queryFn: checkAuthStatus,
    retry: false,
  });

  // Pick the default mode from server state: no owner → register, owner exists → login.
  useEffect(() => {
    if (statusQuery.data && !statusQuery.data.authenticated) {
      setMode(statusQuery.data.hasOwner ? "login" : "register");
    }
  }, [statusQuery.data]);

  const loginMutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      login(input.password),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auth", "status"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("auth.loginFailed"));
    },
  });

  const registerMutation = useMutation({
    mutationFn: (input: {
      name: string;
      email: string;
      password: string;
      password2: string;
      passwordHint: string;
      inviteCode: string;
    }) =>
      register({
        name: input.name,
        password: input.password,
        hint: input.passwordHint || undefined,
      }),
    onSuccess: () => {
      toast.success(t("auth.registrationSuccess"));
      setLoginValues(EMPTY_LOGIN);
      setMode("login");
    },
    onError: (err: Error) => {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("already configured")) {
        toast.info(t("auth.alreadyConfigured"));
        setLoginValues(EMPTY_LOGIN);
        setRegisterValues(EMPTY_REGISTER);
        setMode("login");
        return;
      }
      toast.error(msg || t("auth.registerFailed"));
    },
  });

  const loginBusy = loginMutation.isPending;
  const registerBusy = registerMutation.isPending;

  function handleLogin() {
    if (loginBusy) return;
    if (!loginValues.password) {
      toast.error(t("auth.invalidField"));
      return;
    }
    loginMutation.mutate({ email: loginValues.email, password: loginValues.password });
  }

  function handleRegister() {
    if (registerBusy) return;
    if (!registerValues.name.trim() || !registerValues.password) {
      toast.error(t("auth.invalidField"));
      return;
    }
    if (
      registerValues.password.length < 12 ||
      registerValues.password2.length < 12
    ) {
      toast.error(t("auth.passwordTooShort"));
      return;
    }
    if (registerValues.password !== registerValues.password2) {
      toast.error(t("auth.passwordsDoNotMatch"));
      return;
    }
    registerMutation.mutate(registerValues);
  }

  async function handleTogglePasswordHint() {
    setHintLoading(true);
    try {
      const hint = await getPasswordHint();
      if (hint) {
        toast.info(hint);
      } else {
        toast.info(t("auth.passwordHint"));
      }
    } catch {
      toast.error(t("auth.loginFailed"));
    } finally {
      setHintLoading(false);
    }
  }

  function handleShowLockedPasswordHint() {
    void handleTogglePasswordHint();
  }

  if (statusQuery.isLoading) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <p className="text-muted-foreground">{t("auth.statusLoading")}</p>
      </div>
    );
  }

  if (statusQuery.data?.authenticated) {
    return null;
  }

  const pendingAction: "login" | "passkey" | "register" | "unlock" | null =
    loginBusy ? "login" : registerBusy ? "register" : null;

  return (
    <AuthViews
      mode={mode}
      pendingAction={pendingAction}
      registrationInviteRequired={false}
      unlockReady={true}
      unlockPreparing={false}
      loginValues={loginValues}
      registerValues={registerValues}
      passkeyPassword=""
      unlockPassword=""
      emailForLock=""
      loginHintLoading={hintLoading}
      onChangeLogin={setLoginValues}
      onChangePasskeyPassword={() => {}}
      onChangeRegister={setRegisterValues}
      onChangeUnlock={() => {}}
      onSubmitLogin={handleLogin}
      onSubmitPasskey={() => {}}
      onSubmitPasskeyUnlock={() => {}}
      onSubmitPasskeyPassword={() => {}}
      onSubmitRegister={handleRegister}
      onSubmitUnlock={handleLogin}
      onGotoLogin={() => setMode("login")}
      onGotoRegister={() => setMode("register")}
      onLogout={() => {}}
      onTogglePasswordHint={handleTogglePasswordHint}
      onShowLockedPasswordHint={handleShowLockedPasswordHint}
    />
  );
}

export function ChangePasswordForm() {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setSuccess(true);
      setError("");
    },
    onError: (err: Error) => {
      setError(err.message || t("auth.changePasswordFailed"));
      setSuccess(false);
    },
  });

  function handleSubmit() {
    setError("");
    setSuccess(false);

    if (!currentPassword.trim() || !newPassword.trim()) {
      setError(t("auth.currentPasswordRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsMustMatch"));
      return;
    }

    mutation.mutate({ currentPassword, newPassword });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="settings-card">
        <h2 className="mb-4 text-lg font-semibold">{t("auth.changePassword")}</h2>

        {success && (
          <p className="mb-3 text-sm text-green-600 dark:text-green-400">
            {t("auth.changePasswordSuccess")}
          </p>
        )}

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        <form
          id="change-password-form"
          className="settings-section"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FloatingLabelInput
            label={t("auth.currentPassword")}
            value={currentPassword}
            onInput={setCurrentPassword}
            type="password"
            autoComplete="current-password"
          />
          <FloatingLabelInput
            label={t("auth.newPassword")}
            value={newPassword}
            onInput={setNewPassword}
            type="password"
            autoComplete="new-password"
          />
          <FloatingLabelInput
            label={t("auth.confirmNewPassword")}
            value={confirmPassword}
            onInput={setConfirmPassword}
            type="password"
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="btn btn-primary full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t("common.loading") : t("auth.changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
