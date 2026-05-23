import type { Turbina, Analise, User, TurbinaStatus, AnaliseStatus } from "@prisma/client";

export type { TurbinaStatus, AnaliseStatus };

export type TurbinaWithAnalises = Turbina & {
  analises: Analise[];
  _count: { analises: number };
};

export type AnaliseWithTurbina = Analise & {
  turbina: Pick<Turbina, "id" | "nome" | "codigo">;
};

export type SafeUser = Omit<User, "senha">;

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TurbinaFilters {
  search?: string;
  status?: TurbinaStatus;
  orderBy?: "nome" | "codigo" | "createdAt";
  order?: "asc" | "desc";
}

export interface AnaliseFilters {
  search?: string;
  status?: AnaliseStatus;
  turbinaId?: string;
  orderBy?: "dataAnalise" | "titulo" | "createdAt";
  order?: "asc" | "desc";
}

export interface DashboardSummary {
  totalTurbinas: number;
  turbinasPorStatus: Record<TurbinaStatus, number>;
  totalAnalises: number;
  analisesPorStatus: Record<AnaliseStatus, number>;
  ultimasAnalises: AnaliseWithTurbina[];
}
