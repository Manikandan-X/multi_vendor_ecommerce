import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "../../lib/validation";
import { useAuthStore } from "../../store/useAuthStore";
import { getApiErrorMessage } from "../../lib/errors";
import { CategoryMosaicPanel } from "../../components/ui/CategoryMosaicPanel";
import { BRAND_NAME } from "../../constants/brand";
import { UserRole } from "../../constants/enums";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean((location.state as { justRegistered?: boolean } | null)?.justRegistered);
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login(values.email, values.password);
      // Route by role — each has a different home surface.
      if (user.role === UserRole.ADMIN) navigate("/admin");
      else if (user.role === UserRole.VENDOR) navigate("/vendor");
      else navigate("/");
    } catch (err) {
      setServerError(getApiErrorMessage(err, "Couldn't sign you in. Check your details."));
    }
  };

  return (
    <div className="flex min-h-screen">
      <CategoryMosaicPanel />

      <div className="flex flex-1 items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <span className="font-display text-xl font-semibold text-ink lg:hidden">
            {BRAND_NAME}
          </span>

          <h1 className="mt-6 font-display text-2xl font-semibold text-ink lg:mt-0">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-muted">
            New here?{" "}
            <Link to="/register" className="font-medium text-ink underline underline-offset-2">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            {justRegistered && (
              <p className="rounded-lg bg-success/10 px-3.5 py-2.5 text-sm text-success">
                Account created. Sign in to continue.
              </p>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p role="alert" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-light disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
