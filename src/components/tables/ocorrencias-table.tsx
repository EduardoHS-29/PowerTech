"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  OCORRENCIA_GRAVIDADE_COLOR,
  OCORRENCIA_GRAVIDADE_LABEL,
} from "@/lib/constants";
import { deleteOcorrenciaAction } from "@/app/(dashboard)/analises/ocorrencia-actions";
import type { OcorrenciaRow } from "@/lib/repositories/ocorrencia/ocorrencia.repository";

interface OcorrenciasTableProps {
  ocorrencias: OcorrenciaRow[];
  analiseId: string;
  onEdit: (ocorrencia: OcorrenciaRow) => void;
  onDeleted: () => void;
}

export function OcorrenciasTable({
  ocorrencias,
  analiseId,
  onEdit,
  onDeleted,
}: OcorrenciasTableProps) {
  if (ocorrencias.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Nenhuma ocorrência registrada.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-medium text-gray-600">
              Tipo de Ocorrência
            </th>
            <th className="px-4 py-3 font-medium text-gray-600">Cód. da Pá</th>
            <th className="px-4 py-3 font-medium text-gray-600">Gravidade</th>
            <th className="px-4 py-3 font-medium text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ocorrencias.map((oc) => (
            <OcorrenciaRowItem
              key={oc.id}
              ocorrencia={oc}
              analiseId={analiseId}
              onEdit={onEdit}
              onDeleted={onDeleted}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OcorrenciaRowItem({
  ocorrencia,
  analiseId,
  onEdit,
  onDeleted,
}: {
  ocorrencia: OcorrenciaRow;
  analiseId: string;
  onEdit: (oc: OcorrenciaRow) => void;
  onDeleted: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Remover esta ocorrência?")) return;
    startTransition(async () => {
      await deleteOcorrenciaAction(ocorrencia.id, analiseId);
      onDeleted();
    });
  }

  const tipoLabel =
    ocorrencia.tipo === "Outras" && ocorrencia.descricaoOutras
      ? ocorrencia.descricaoOutras
      : ocorrencia.tipo;

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="max-w-xs px-4 py-3">
        <span className="line-clamp-2 text-gray-700">{tipoLabel}</span>
        {ocorrencia.tipo === "Outras" && ocorrencia.descricaoOutras && (
          <span className="text-xs text-gray-400">Outras</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs font-medium text-gray-700">
          {ocorrencia.pa.codigo}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge className={OCORRENCIA_GRAVIDADE_COLOR[ocorrencia.gravidade]}>
          {ocorrencia.gravidade} — {OCORRENCIA_GRAVIDADE_LABEL[ocorrencia.gravidade]}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(ocorrencia)}
            type="button"
          >
            <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={isPending}
            onClick={handleDelete}
            type="button"
          >
            <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
