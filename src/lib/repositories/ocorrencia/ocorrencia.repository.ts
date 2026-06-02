import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type { OcorrenciaParsed } from "@/lib/validations/ocorrencia";

const ocorrenciaSelect = {
  id: true,
  analiseId: true,
  paId: true,
  tipo: true,
  descricaoOutras: true,
  gravidade: true,
  createdAt: true,
  updatedAt: true,
  pa: {
    select: { id: true, codigo: true, ordem: true },
  },
} satisfies Prisma.OcorrenciaSelect;

export type OcorrenciaRow = Prisma.OcorrenciaGetPayload<{
  select: typeof ocorrenciaSelect;
}>;

export const ocorrenciaRepository = {
  async findByAnalise(analiseId: string): Promise<OcorrenciaRow[]> {
    return prisma.ocorrencia.findMany({
      where: { analiseId },
      orderBy: { createdAt: "asc" },
      select: ocorrenciaSelect,
    });
  },

  async findById(id: string): Promise<OcorrenciaRow | null> {
    return prisma.ocorrencia.findUnique({
      where: { id },
      select: ocorrenciaSelect,
    });
  },

  async create(analiseId: string, data: OcorrenciaParsed): Promise<OcorrenciaRow> {
    return prisma.ocorrencia.create({
      data: { analiseId, ...data },
      select: ocorrenciaSelect,
    });
  },

  async update(id: string, data: Partial<OcorrenciaParsed>): Promise<OcorrenciaRow> {
    return prisma.ocorrencia.update({
      where: { id },
      data,
      select: ocorrenciaSelect,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.ocorrencia.delete({ where: { id } });
  },
};
