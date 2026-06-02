import { z } from "zod";

export const ocorrenciaSchema = z
  .object({
    paId: z.string().min(1, "Selecione uma pá"),
    tipo: z.string().min(1, "Selecione o tipo de ocorrência"),
    descricaoOutras: z
      .string()
      .max(2000, "Descrição muito longa")
      .optional(),
    gravidade: z.coerce
      .number({ message: "Selecione a gravidade" })
      .int()
      .min(1)
      .max(5, "Gravidade inválida"),
  })
  .refine(
    (d) =>
      d.tipo !== "Outras" ||
      (d.descricaoOutras && d.descricaoOutras.trim().length > 0),
    {
      message: "Descreva a ocorrência quando o tipo for Outras",
      path: ["descricaoOutras"],
    }
  );

export type OcorrenciaInput = z.input<typeof ocorrenciaSchema>;
export type OcorrenciaParsed = z.infer<typeof ocorrenciaSchema>;
