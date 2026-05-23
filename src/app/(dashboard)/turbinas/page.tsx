import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TurbinaTable } from "@/components/tables/turbinas-table";
import { Pagination } from "@/components/shared/pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusFilter } from "@/components/shared/status-filter";
import { turbinaService } from "@/lib/services/turbina/turbina.service";
import {
  parsePaginationParams,
  getStringParam,
} from "@/lib/utils";
import {
  TURBINA_STATUS_LABEL,
  ROUTES,
  PAGINATION_DEFAULT_PER_PAGE,
} from "@/lib/constants";
import type { TurbinaStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Turbinas" };

interface TurbinasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function TurbinasList({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page, perPage } = parsePaginationParams(
    searchParams.page,
    searchParams.perPage
  );
  const search = getStringParam(searchParams.q);
  const status = getStringParam(searchParams.status) as TurbinaStatus | undefined;

  const result = await turbinaService.list(
    { search, status },
    { page, perPage }
  );

  if (result.data.length === 0) {
    return (
      <EmptyState
        title="Nenhuma turbina encontrada"
        description={
          search
            ? `Sem resultados para "${search}". Tente outros termos.`
            : "Cadastre a primeira turbina do sistema."
        }
        action={
          !search
            ? { label: "Cadastrar Turbina", href: ROUTES.TURBINAS_NOVO }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <TurbinaTable turbinas={result.data} />
      <Pagination
        currentPage={result.meta.page}
        totalPages={result.meta.totalPages}
        total={result.meta.total}
        perPage={result.meta.perPage}
      />
    </>
  );
}

export default async function TurbinasPage({ searchParams }: TurbinasPageProps) {
  const params = await searchParams;
  const search = getStringParam(params.q);

  const statusOptions = [
    { value: "", label: "Todos os status" },
    ...Object.entries(TURBINA_STATUS_LABEL).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turbinas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie o parque de turbinas
          </p>
        </div>
        <Link href={ROUTES.TURBINAS_NOVO}>
          <Button>+ Nova Turbina</Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              placeholder="Buscar por nome, código, fabricante..."
              defaultValue={search ?? ""}
            />
          </div>
          <div className="w-full sm:w-48">
            <StatusFilter
              options={statusOptions}
              defaultValue={getStringParam(params.status) ?? ""}
            />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="space-y-2 p-4">
              {Array.from({ length: PAGINATION_DEFAULT_PER_PAGE }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded bg-gray-100"
                  />
                )
              )}
            </div>
          }
        >
          <TurbinasList searchParams={params} />
        </Suspense>
      </Card>
    </div>
  );
}
