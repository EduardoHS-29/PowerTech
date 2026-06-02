import { prisma } from "@/lib/db/prisma";
import type { Prisma, TurbinaStatus } from "@prisma/client";
import type {
  PaginationParams,
  PaginatedResult,
  TurbinaFilters,
} from "@/lib/types";
import { calculatePaginationMeta } from "@/lib/utils";
import type { TurbinaParsed } from "@/lib/validations/turbina";

const turbinaSelect = {
  id: true,
  nome: true,
  codigo: true,
  fabricante: true,
  modelo: true,
  potencia: true,
  dataInstalacao: true,
  dataFabricacao: true,
  status: true,
  observacoes: true,
  createdAt: true,
  updatedAt: true,
  pas: {
    select: {
      id: true,
      ordem: true,
      codigo: true,
      modelo: true,
      dataUltimaAnalise: true,
    },
    orderBy: { ordem: "asc" as const },
  },
  _count: { select: { analises: true } },
} satisfies Prisma.TurbinaSelect;

export type TurbinaRow = Prisma.TurbinaGetPayload<{
  select: typeof turbinaSelect;
}>;

export const turbinaRepository = {
  async findMany(
    filters: TurbinaFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<TurbinaRow>> {
    const where: Prisma.TurbinaWhereInput = {};

    if (filters.search) {
      where.OR = [
        { nome: { contains: filters.search } },
        { codigo: { contains: filters.search } },
        { fabricante: { contains: filters.search } },
        { modelo: { contains: filters.search } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const orderBy: Prisma.TurbinaOrderByWithRelationInput = {
      [filters.orderBy ?? "createdAt"]: filters.order ?? "desc",
    };

    const skip = (pagination.page - 1) * pagination.perPage;

    const [data, total] = await Promise.all([
      prisma.turbina.findMany({
        where,
        orderBy,
        skip,
        take: pagination.perPage,
        select: turbinaSelect,
      }),
      prisma.turbina.count({ where }),
    ]);

    return { data, meta: calculatePaginationMeta(total, pagination) };
  },

  async findById(id: string): Promise<TurbinaRow | null> {
    return prisma.turbina.findUnique({
      where: { id },
      select: turbinaSelect,
    });
  },

  async findByCodigo(codigo: string): Promise<{ id: string } | null> {
    return prisma.turbina.findUnique({
      where: { codigo },
      select: { id: true },
    });
  },

  async findAllForSelect(): Promise<{ id: string; nome: string; codigo: string }[]> {
    return prisma.turbina.findMany({
      where: { status: "ATIVA" },
      select: { id: true, nome: true, codigo: true },
      orderBy: { nome: "asc" },
    });
  },

  async create(data: TurbinaParsed) {
    const { pas, dataFabricacao, dataInstalacao, ...rest } = data;
    return prisma.turbina.create({
      data: {
        ...rest,
        dataInstalacao: new Date(dataInstalacao),
        dataFabricacao: new Date(dataFabricacao),
        pas: {
          create: pas.map((pa, i) => ({
            ordem: i + 1,
            codigo: pa.codigo,
            modelo: pa.modelo,
            ...(pa.dataUltimaAnalise && {
              dataUltimaAnalise: new Date(pa.dataUltimaAnalise),
            }),
          })),
        },
      },
      select: turbinaSelect,
    });
  },

  async update(id: string, data: Partial<TurbinaParsed>) {
    const { pas, dataFabricacao, dataInstalacao, ...rest } = data;
    return prisma.turbina.update({
      where: { id },
      data: {
        ...rest,
        ...(dataInstalacao && { dataInstalacao: new Date(dataInstalacao) }),
        ...(dataFabricacao && { dataFabricacao: new Date(dataFabricacao) }),
        ...(pas && {
          pas: {
            upsert: pas.map((pa, i) => ({
              where: { turbinaId_ordem: { turbinaId: id, ordem: i + 1 } },
              update: {
                codigo: pa.codigo,
                modelo: pa.modelo,
                dataUltimaAnalise: pa.dataUltimaAnalise
                  ? new Date(pa.dataUltimaAnalise)
                  : null,
              },
              create: {
                ordem: i + 1,
                codigo: pa.codigo,
                modelo: pa.modelo,
                ...(pa.dataUltimaAnalise && {
                  dataUltimaAnalise: new Date(pa.dataUltimaAnalise),
                }),
              },
            })),
          },
        }),
      },
      select: turbinaSelect,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.turbina.delete({ where: { id } });
  },

  async updatePaDataUltimaAnalise(paId: string, date: Date): Promise<void> {
    await prisma.pa.update({
      where: { id: paId },
      data: { dataUltimaAnalise: date },
    });
  },

  async countByStatus(): Promise<Record<TurbinaStatus, number>> {
    const result = await prisma.turbina.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const counts: Partial<Record<TurbinaStatus, number>> = {};
    for (const row of result) {
      counts[row.status] = row._count.status;
    }

    return {
      ATIVA: counts.ATIVA ?? 0,
      INATIVA: counts.INATIVA ?? 0,
      MANUTENCAO: counts.MANUTENCAO ?? 0,
    };
  },
};
