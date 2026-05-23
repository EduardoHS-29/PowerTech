import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AnaliseTable } from "@/components/tables/analises-table";
import { Pagination } from "@/components/shared/pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusFilter } from "@/components/shared/status-filter";
import { analiseService } from "@/lib/services/analise/analise.service";
import { parsePaginationParams, getStringParam } from "@/lib/utils";
import {
  ANALISE_STATUS_LABEL,
  ROUTES,
  PAGINATION_DEFAULT_PER_PAGE,
} from "@/lib/constants";
import type { AnaliseStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Análises" };

interface AnalisesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function AnalisesList({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page, perPage } = parsePaginationParams(
    searchParams.page,
    searchParams.perPage
  );
  const search = getStringParam(searchParams.q);
  const status = getStringParam(searchParams.status) as AnaliseStatus | undefined;
  const turbinaId = getStringParam(searchParams.turbinaId);

  const result = await analiseService.list(
    { search, status, turbinaId },
    { page, perPage }
  );

  if (result.data.length === 0) {
    return (
      <EmptyState
        title="Nenhuma análise encontrada"
        description={
          search
            ? `Sem resultados para "${search}".`
            : "Registre a primeira análise técnica."
        }
        action={
          !search
            ? { label: "Registrar Análise", href: ROUTES.ANALISES_NOVO }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <AnaliseTable analises={result.data} />
      <Pagination
        currentPage={result.meta.page}
        totalPages={result.meta.totalPages}
        total={result.meta.total}
        perPage={result.meta.perPage}
      />
    </>
  );
}

export default async function AnalisesPage({ searchParams }: AnalisesPageProps) {
  const params = await searchParams;
  const search = getStringParam(params.q);

  const statusOptions = [
    { value: "", label: "Todos os status" },
    ...Object.entries(ANALISE_STATUS_LABEL).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análises</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as análises técnicas
          </p>
        </div>
        <Link href={ROUTES.ANALISES_NOVO}>
          <Button>+ Nova Análise</Button>
        </Link>
      </div>

      <Card>
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              placeholder="Buscar por título, turbina, responsável..."
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
          <AnalisesList searchParams={params} />
        </Suspense>
      </Card>
    </div>
  );
}
