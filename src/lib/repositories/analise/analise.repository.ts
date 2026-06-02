import { prisma } from "@/lib/db/prisma";
import type { Prisma, AnaliseStatus } from "@prisma/client";
import type {
  PaginationParams,
  PaginatedResult,
  AnaliseFilters,
} from "@/lib/types";
import { calculatePaginationMeta } from "@/lib/utils";
import type { AnaliseInput } from "@/lib/validations/analise";

const analiseSelect = {
  id: true,
  titulo: true,
  status: true,
  responsavel: true,
  dataAnalise: true,
  observacoes: true,
  createdAt: true,
  updatedAt: true,
  turbinaId: true,
  turbina: {
    select: { id: true, nome: true, codigo: true },
  },
} satisfies Prisma.AnaliseSelect;

export type AnaliseRow = Prisma.AnaliseGetPayload<{
  select: typeof analiseSelect;
}>;

const analiseRecentSelect = {
  id: true,
  titulo: true,
  status: true,
  responsavel: true,
  dataAnalise: true,
  createdAt: true,
  updatedAt: true,
  turbinaId: true,
  turbina: {
    select: { id: true, nome: true, codigo: true },
  },
  ocorrencias: {
    select: { gravidade: true },
    orderBy: { gravidade: "desc" as const },
    take: 1,
  },
} satisfies Prisma.AnaliseSelect;

export type AnaliseRecentRow = Prisma.AnaliseGetPayload<{
  select: typeof analiseRecentSelect;
}>;

export const analiseRepository = {
  async findMany(
    filters: AnaliseFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<AnaliseRow>> {
    const where: Prisma.AnaliseWhereInput = {};

    if (filters.search) {
      where.OR = [
        { titulo: { contains: filters.search } },
        { responsavel: { contains: filters.search } },
        { turbina: { nome: { contains: filters.search } } },
        { turbina: { codigo: { contains: filters.search } } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.turbinaId) {
      where.turbinaId = filters.turbinaId;
    }

    const orderBy: Prisma.AnaliseOrderByWithRelationInput = {
      [filters.orderBy ?? "createdAt"]: filters.order ?? "desc",
    };

    const skip = (pagination.page - 1) * pagination.perPage;

    const [data, total] = await Promise.all([
      prisma.analise.findMany({
        where,
        orderBy,
        skip,
        take: pagination.perPage,
        select: analiseSelect,
      }),
      prisma.analise.count({ where }),
    ]);

    return { data, meta: calculatePaginationMeta(total, pagination) };
  },

  async findById(id: string): Promise<AnaliseRow | null> {
    return prisma.analise.findUnique({
      where: { id },
      select: analiseSelect,
    });
  },

  async findRecentByTurbina(
    turbinaId: string,
    limit = 5
  ): Promise<AnaliseRow[]> {
    return prisma.analise.findMany({
      where: { turbinaId },
      orderBy: { dataAnalise: "desc" },
      take: limit,
      select: analiseSelect,
    });
  },

  async findRecent(limit = 5): Promise<AnaliseRow[]> {
    return prisma.analise.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: analiseSelect,
    });
  },

  async findRecentWithGravidade(limit = 5): Promise<AnaliseRecentRow[]> {
    return prisma.analise.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: analiseRecentSelect,
    });
  },

  async create(data: AnaliseInput) {
    return prisma.analise.create({
      data: {
        ...data,
        dataAnalise: new Date(data.dataAnalise),
      },
      select: analiseSelect,
    });
  },

  async update(id: string, data: Partial<AnaliseInput>) {
    return prisma.analise.update({
      where: { id },
      data: {
        ...data,
        ...(data.dataAnalise && {
          dataAnalise: new Date(data.dataAnalise),
        }),
      },
      select: analiseSelect,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.analise.delete({ where: { id } });
  },

  async countByStatus(): Promise<Record<AnaliseStatus, number>> {
    const result = await prisma.analise.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const counts: Partial<Record<AnaliseStatus, number>> = {};
    for (const row of result) {
      counts[row.status] = row._count.status;
    }

    return {
      PENDENTE: counts.PENDENTE ?? 0,
      EM_ANDAMENTO: counts.EM_ANDAMENTO ?? 0,
      CONCLUIDA: counts.CONCLUIDA ?? 0,
      CANCELADA: counts.CANCELADA ?? 0,
    };
  },
};
