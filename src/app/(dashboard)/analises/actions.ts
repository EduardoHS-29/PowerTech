"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { analiseService } from "@/lib/services/analise/analise.service";
import { analiseSchema } from "@/lib/validations/analise";
import { handleActionError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { ROUTES } from "@/lib/constants";

export async function createAnaliseAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    turbinaId: formData.get("turbinaId"),
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    resultado: formData.get("resultado") || undefined,
    status: formData.get("status"),
    responsavel: formData.get("responsavel"),
    dataAnalise: formData.get("dataAnalise"),
    observacoes: formData.get("observacoes") || undefined,
  };

  const parsed = analiseSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let createdId: string;
  try {
    const analise = await analiseService.create(parsed.data);
    createdId = analise.id;
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.ANALISES);
  redirect(ROUTES.ANALISE(createdId));
}

export async function updateAnaliseAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    turbinaId: formData.get("turbinaId"),
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    resultado: formData.get("resultado") || undefined,
    status: formData.get("status"),
    responsavel: formData.get("responsavel"),
    dataAnalise: formData.get("dataAnalise"),
    observacoes: formData.get("observacoes") || undefined,
  };

  const parsed = analiseSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await analiseService.update(id, parsed.data);
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.ANALISES);
  revalidatePath(ROUTES.ANALISE(id));
  revalidatePath(ROUTES.ANALISE_EDITAR(id));
  redirect(ROUTES.ANALISE(id));
}

export async function deleteAnaliseAction(id: string): Promise<ActionResult> {
  try {
    await analiseService.delete(id);
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.ANALISES);
  redirect(ROUTES.ANALISES);
}
