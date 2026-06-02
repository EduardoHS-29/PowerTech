import { z } from "zod";
import { AnaliseStatus } from "@prisma/client";

export const analiseSchema = z.object({
  turbinaId: z.string().min(1, "Turbina é obrigatória"),
  titulo: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  status: z.nativeEnum(AnaliseStatus, { message: "Status inválido" }),
  responsavel: z
    .string()
    .min(1, "Responsável é obrigatório")
    .max(100, "Nome do responsável muito longo"),
  dataAnalise: z.string().min(1, "Data da análise é obrigatória"),
  observacoes: z.string().max(2000, "Observações muito longas").optional(),
});

export const analiseUpdateSchema = analiseSchema.partial().extend({
  id: z.string().cuid("ID inválido"),
});

export type AnaliseInput = z.infer<typeof analiseSchema>;
export type AnaliseUpdateInput = z.infer<typeof analiseUpdateSchema>;
