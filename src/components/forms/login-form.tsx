"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/app/(auth)/login/actions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import type { ActionResult } from "@/lib/errors";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null
  );

  const {
    register,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const fieldError = (field: string): string | undefined =>
    state && !state.success ? state.fieldErrors?.[field]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.success && !state.fieldErrors && (
        <Alert type="error">{state.error}</Alert>
      )}

      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        required
        placeholder="seu@email.com"
        {...register("email")}
        error={errors.email?.message ?? fieldError("email")}
      />

      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        {...register("senha")}
        error={errors.senha?.message ?? fieldError("senha")}
      />

      <Button type="submit" loading={isPending} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
