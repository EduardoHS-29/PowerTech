"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { turbinaService } from "@/lib/services/turbina/turbina.service";
import { turbinaSchema } from "@/lib/validations/turbina";
import { handleActionError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { ROUTES } from "@/lib/constants";

export async function createTurbinaAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    nome: formData.get("nome"),
    codigo: formData.get("codigo"),
    fabricante: formData.get("fabricante"),
    modelo: formData.get("modelo"),
    potencia: formData.get("potencia"),
    dataInstalacao: formData.get("dataInstalacao"),
    dataFabricacao: formData.get("dataFabricacao") || undefined,
    status: formData.get("status"),
    observacoes: formData.get("observacoes") || undefined,
    pas: [0, 1, 2].map((i) => ({
      codigo: formData.get(`pas.${i}.codigo`),
      modelo: formData.get(`pas.${i}.modelo`),
      dataUltimaAnalise: formData.get(`pas.${i}.dataUltimaAnalise`) || undefined,
    })),
  };

  const parsed = turbinaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let createdId: string;
  try {
    const turbina = await turbinaService.create(parsed.data);
    createdId = turbina.id;
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.TURBINAS);
  redirect(ROUTES.TURBINA(createdId));
}

export async function updateTurbinaAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    nome: formData.get("nome"),
    codigo: formData.get("codigo"),
    fabricante: formData.get("fabricante"),
    modelo: formData.get("modelo"),
    potencia: formData.get("potencia"),
    dataInstalacao: formData.get("dataInstalacao"),
    dataFabricacao: formData.get("dataFabricacao") || undefined,
    status: formData.get("status"),
    observacoes: formData.get("observacoes") || undefined,
    pas: [0, 1, 2].map((i) => ({
      codigo: formData.get(`pas.${i}.codigo`),
      modelo: formData.get(`pas.${i}.modelo`),
      dataUltimaAnalise: formData.get(`pas.${i}.dataUltimaAnalise`) || undefined,
    })),
  };

  const parsed = turbinaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await turbinaService.update(id, parsed.data);
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.TURBINAS);
  revalidatePath(ROUTES.TURBINA(id));
  revalidatePath(ROUTES.TURBINA_EDITAR(id));
  redirect(ROUTES.TURBINA(id));
}

export async function deleteTurbinaAction(
  id: string
): Promise<ActionResult> {
  try {
    await turbinaService.delete(id);
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.TURBINAS);
  redirect(ROUTES.TURBINAS);
}
