"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TURBINA_STATUS_LABEL,
  TURBINA_STATUS_COLOR,
  ROUTES,
} from "@/lib/constants";
import { formatDate, formatPotencia } from "@/lib/utils";
import type { TurbinaRow } from "@/lib/repositories/turbina/turbina.repository";
import { deleteTurbinaAction } from "@/app/(dashboard)/turbinas/actions";
import { useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

interface TurbinaTableProps {
  turbinas: TurbinaRow[];
}

export function TurbinaTable({ turbinas }: TurbinaTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-medium text-gray-600">Código</th>
            <th className="px-4 /py-3 font-medium text-gray-600">Nome</th>
            <th className="px-4 py-3 font-medium text-gray-600">Fabricante</th>
            <th className="px-4 py-3 font-medium text-gray-600">Modelo</th>
            <th className="px-4 py-3 font-medium text-gray-600">Análises</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {turbinas.map((turbina) => (
            <TurbinaRow key={turbina.id} turbina={turbina} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TurbinaRow({ turbina }: { turbina: TurbinaRow }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Remover a turbina "${turbina.nome}"? Esta ação não pode ser desfeita.`)) return;
    startTransition(() => {
      deleteTurbinaAction(turbina.id);
    });
  }

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="px-4 py-3">
        <Link
          href={ROUTES.TURBINA(turbina.id)}
          className="font-medium text-primary hover:underline"
        >
          {turbina.codigo}
        </Link>
      </td>
      <td className="px-4 py-3 text-gray-600">{turbina.nome}</td>
      <td className="px-4 py-3 text-gray-600">{turbina.fabricante}</td>
      <td className="px-4 py-3 text-gray-600">{turbina.modelo}</td>
      <td className="px-4 py-3 text-center text-gray-600">
        {turbina._count.analises}
      </td>
      <td className="px-4 py-3">
        <Badge className={TURBINA_STATUS_COLOR[turbina.status]}>
          {TURBINA_STATUS_LABEL[turbina.status]}
        </Badge>
      </td>
      <td className="pr-4 py-3">
        <div className="flex items-center gap-2">
          <Link href={ROUTES.TURBINA_EDITAR(turbina.id)}>
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
