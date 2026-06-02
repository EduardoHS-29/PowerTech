"use server";

import { revalidatePath } from "next/cache";
import { ocorrenciaService } from "@/lib/services/ocorrencia/ocorrencia.service";
import { ocorrenciaSchema } from "@/lib/validations/ocorrencia";
import { handleActionError } from "@/lib/errors";
import type { ActionResult } from "@/lib/errors";
import { ROUTES } from "@/lib/constants";

export async function createOcorrenciaAction(
  analiseId: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    paId: formData.get("paId"),
    tipo: formData.get("tipo"),
    descricaoOutras: formData.get("descricaoOutras") || undefined,
    gravidade: formData.get("gravidade"),
  };

  const parsed = ocorrenciaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await ocorrenciaService.create(analiseId, parsed.data);
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.ANALISE(analiseId));
  revalidatePath(ROUTES.ANALISE_EDITAR(analiseId));
  return { success: true, data: undefined };
}

export async function updateOcorrenciaAction(
  id: string,
  analiseId: string,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    paId: formData.get("paId"),
    tipo: formData.get("tipo"),
    descricaoOutras: formData.get("descricaoOutras") || undefined,
    gravidade: formData.get("gravidade"),
  };

  const parsed = ocorrenciaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await ocorrenciaService.update(id, parsed.data);
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.ANALISE(analiseId));
  revalidatePath(ROUTES.ANALISE_EDITAR(analiseId));
  return { success: true, data: undefined };
}

export async function deleteOcorrenciaAction(
  id: string,
  analiseId: string
): Promise<ActionResult> {
  try {
    await ocorrenciaService.delete(id);
  } catch (error) {
    return handleActionError(error);
  }

  revalidatePath(ROUTES.ANALISE(analiseId));
  revalidatePath(ROUTES.ANALISE_EDITAR(analiseId));
  return { success: true, data: undefined };
}
