import { z } from "zod";
import { TurbinaStatus } from "@prisma/client";

const paInputSchema = z.object({
  codigo: z
    .string()
    .min(1, "Código da pá é obrigatório")
    .max(50, "Código deve ter no máximo 50 caracteres"),
  modelo: z
    .string()
    .min(1, "Modelo da pá é obrigatório")
    .max(100, "Modelo deve ter no máximo 100 caracteres"),
  dataUltimaAnalise: z.string().optional(),
});

export type PaInput = z.infer<typeof paInputSchema>;

export const turbinaSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  codigo: z
    .string()
    .min(1, "Código é obrigatório")
    .max(50, "Código deve ter no máximo 50 caracteres")
    .toUpperCase(),
  fabricante: z
    .string()
    .min(1, "Fabricante é obrigatório")
    .max(100, "Fabricante deve ter no máximo 100 caracteres"),
  modelo: z
    .string()
    .min(1, "Modelo é obrigatório")
    .max(100, "Modelo deve ter no máximo 100 caracteres"),
  potencia: z.coerce
    .number({ message: "Potência deve ser um número" })
    .positive("Potência deve ser positiva")
    .max(50000, "Potência deve ser menor que 50.000 kW"),
  dataInstalacao: z.string().min(1, "Data de instalação é obrigatória"),
  dataFabricacao: z.string().min(1, "Data de fabricação é obrigatória"),
  status: z.nativeEnum(TurbinaStatus, { message: "Status inválido" }),
  observacoes: z.string().max(2000, "Observações muito longas").optional(),
  pas: z.tuple([paInputSchema, paInputSchema, paInputSchema]),
});

export const turbinaUpdateSchema = turbinaSchema.partial().extend({
  id: z.string().cuid("ID inválido"),
});

export type TurbinaInput = z.input<typeof turbinaSchema>;
export type TurbinaParsed = z.infer<typeof turbinaSchema>;
export type TurbinaUpdateInput = z.infer<typeof turbinaUpdateSchema>;
