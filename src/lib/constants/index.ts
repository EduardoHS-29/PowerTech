import type { TurbinaStatus, AnaliseStatus } from "@prisma/client";

export const PAGINATION_DEFAULT_PAGE = 1;
export const PAGINATION_DEFAULT_PER_PAGE = 10;
export const PAGINATION_MAX_PER_PAGE = 100;

export const SESSION_COOKIE_NAME = "powertech_session";

export const TURBINA_STATUS_LABEL: Record<TurbinaStatus, string> = {
  ATIVA: "Ativa",
  INATIVA: "Inativa",
  MANUTENCAO: "Manutenção",
};

export const ANALISE_STATUS_LABEL: Record<AnaliseStatus, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const TURBINA_STATUS_COLOR: Record<TurbinaStatus, string> = {
  ATIVA: "bg-green-100 text-green-800",
  INATIVA: "bg-gray-100 text-gray-800",
  MANUTENCAO: "bg-yellow-100 text-yellow-800",
};

export const ANALISE_STATUS_COLOR: Record<AnaliseStatus, string> = {
  PENDENTE: "bg-blue-100 text-blue-800",
  EM_ANDAMENTO: "bg-yellow-100 text-yellow-800",
  CONCLUIDA: "bg-green-100 text-green-800",
  CANCELADA: "bg-red-100 text-red-800",
};

export const TIPOS_OCORRENCIA = [
  "Erosão da ponta da pá",
  "Rachadura superficial",
  "Delaminação",
  "Impacto por relâmpago",
  "Contaminação por detritos",
  "Desgaste por fadiga estrutural",
  "Outras",
] as const;

export type TipoOcorrencia = (typeof TIPOS_OCORRENCIA)[number];

export const OCORRENCIA_GRAVIDADE_LABEL: Record<number, string> = {
  1: "Baixa",
  2: "Leve",
  3: "Moderada",
  4: "Alta",
  5: "Urgente",
};

export const OCORRENCIA_GRAVIDADE_COLOR: Record<number, string> = {
  1: "bg-green-100 text-green-800",
  2: "bg-lime-100 text-lime-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-orange-100 text-orange-800",
  5: "bg-red-100 text-red-800",
};

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  TURBINAS: "/turbinas",
  TURBINAS_NOVO: "/turbinas/novo",
  TURBINA: (id: string) => `/turbinas/${id}`,
  TURBINA_EDITAR: (id: string) => `/turbinas/${id}/editar`,
  ANALISES: "/analises",
  ANALISES_NOVO: "/analises/novo",
  ANALISE: (id: string) => `/analises/${id}`,
  ANALISE_EDITAR: (id: string) => `/analises/${id}/editar`,
} as const;
