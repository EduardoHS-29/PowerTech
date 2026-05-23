"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ANALISE_STATUS_LABEL,
  ANALISE_STATUS_COLOR,
  ROUTES,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AnaliseRow } from "@/lib/repositories/analise/analise.repository";
import { deleteAnaliseAction } from "@/app/(dashboard)/analises/actions";
import { useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

interface AnaliseTableProps {
  analises: AnaliseRow[];
}

export function AnaliseTable({ analises }: AnaliseTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-medium text-gray-600">Título</th>
            <th className="px-4 py-3 font-medium text-gray-600">Turbina</th>
            <th className="px-4 py-3 font-medium text-gray-600">Responsável</th>
            <th className="px-4 py-3 font-medium text-gray-600">Data</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {analises.map((analise) => (
            <AnaliseRow key={analise.id} analise={analise} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnaliseRow({ analise }: { analise: AnaliseRow }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Remover a análise "${analise.titulo}"?`)) return;
    startTransition(() => {
      deleteAnaliseAction(analise.id);
    });
  }

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-4 py-3">
        <Link
          href={ROUTES.ANALISE(analise.id)}
          className="font-medium text-primary hover:underline"
        >
          {analise.titulo}
        </Link>
      </td>
      <td className="px-4 py-3">
        <Link
          href={ROUTES.TURBINA(analise.turbinaId)}
          className="text-gray-600 hover:text-primary"
        >
          <span className="font-mono text-xs text-gray-500">
            {analise.turbina.codigo}
          </span>{" "}
          {analise.turbina.nome}
        </Link>
      </td>
      <td className="px-4 py-3 text-gray-600">{analise.responsavel}</td>
      <td className="px-4 py-3 text-gray-600">
        {formatDate(analise.dataAnalise)}
      </td>
      <td className="px-4 py-3">
        <Badge className={ANALISE_STATUS_COLOR[analise.status]}>
          {ANALISE_STATUS_LABEL[analise.status]}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href={ROUTES.ANALISE_EDITAR(analise.id)}>
            <Button variant="ghost" size="sm">
              <FontAwesomeIcon icon={faEdit} className="h-8 w-8" />
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            loading={isPending}
            onClick={handleDelete}
          >
            <FontAwesomeIcon icon={faTrash} className="h-8 w-8" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
