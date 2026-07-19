import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "../../lib/validation";
import { registerUser } from "../../api/auth";
import { getApiErrorMessage } from "../../lib/errors";
import { CategoryMosaicPanel } from "../../components/ui/CategoryMosaicPanel";
import { BRAND_NAME } from "../../constants/brand";
import { UserRole } from "../../constants/enums";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: UserRole.CUSTOMER },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      // Register only creates the account — no token is issued — so send
      // them to log in next, with a flag to show a confirmation message.
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      setServerError(getApiErrorMessage(err, "Couldn't create your account."));
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-ink underline underline-offset-2">
              Sign in
            </Link>
          </p>

          {/* Role toggle — segmented control, not a dropdown, because this
              is a binary choice that changes the whole account type. */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface p-1">
            {[
              { value: UserRole.CUSTOMER, label: "Shop" },
              { value: UserRole.VENDOR, label: "Sell" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("role", opt.value)}
                className={`rounded-md py-2 text-sm font-medium transition-colors ${
                  selectedRole === opt.value
                    ? "bg-ink text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {selectedRole === UserRole.VENDOR && (
            <p className="mt-2 text-xs text-muted">
              You'll set up your store details after signing in.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-ink">
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                autoComplete="name"
                {...register("full_name")}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-danger">{errors.full_name.message}</p>
              )}
            </div>

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
                autoComplete="new-password"
                {...register("password")}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-muted">8–100 characters</p>
            </div>

            {serverError && (
              <p role="alert" className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-accent-deep disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
