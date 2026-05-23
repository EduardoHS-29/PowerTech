"use server";

import { redirect } from "next/navigation";
import { authService } from "@/lib/services/auth/auth.service";
import { loginSchema } from "@/lib/validations/auth";
import { handleActionError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    senha: formData.get("senha"),
  };

  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await authService.login(parsed.data);
  } catch (error) {
    return handleActionError(error);
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await authService.logout();
  redirect("/login");
}
