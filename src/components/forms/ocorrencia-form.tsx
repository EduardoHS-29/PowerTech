"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ocorrenciaSchema, type OcorrenciaInput } from "@/lib/validations/ocorrencia";
import {
  createOcorrenciaAction,
  updateOcorrenciaAction,
} from "@/app/(dashboard)/analises/ocorrencia-actions";
import {
  TIPOS_OCORRENCIA,
  OCORRENCIA_GRAVIDADE_COLOR,
  OCORRENCIA_GRAVIDADE_LABEL,
} from "@/lib/constants";
import type { OcorrenciaRow } from "@/lib/repositories/ocorrencia/ocorrencia.repository";

interface PaOption {
  id: string;
  codigo: string;
  ordem: number;
}

interface OcorrenciaFormProps {
  analiseId: string;
  turbinaCodigo: string;
  turbinaNome: string;
  pas: PaOption[];
  ocorrencia?: OcorrenciaRow | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const tipoOptions = TIPOS_OCORRENCIA.map((t) => ({ value: t, label: t }));

const gravidadeOptions = [
  { value: "1", label: "1 — Baixa" },
  { value: "2", label: "2 — Leve" },
  { value: "3", label: "3 — Moderada" },
  { value: "4", label: "4 — Alta" },
  { value: "5", label: "5 — Urgente" },
];

export function OcorrenciaForm({
  analiseId,
  turbinaCodigo,
  turbinaNome,
  pas,
  ocorrencia,
  onSuccess,
  onCancel,
}: OcorrenciaFormProps) {
  const isEditing = !!ocorrencia;
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<OcorrenciaInput>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: {
      paId: ocorrencia?.paId ?? "",
      tipo: ocorrencia?.tipo ?? "",
      descricaoOutras: ocorrencia?.descricaoOutras ?? "",
      gravidade: ocorrencia?.gravidade ?? 3,
    },
  });

  const tipoSelecionado = watch("tipo");
  const gravidadeSelecionada = watch("gravidade");
  const isOutras = tipoSelecionado === "Outras";

  const paOptions = pas.map((p) => ({
    value: p.id,
    label: `Pá ${p.ordem} — ${p.codigo}`,
  }));

  function onSubmit(data: OcorrenciaInput) {
    setSubmitError(null);
    const fd = new FormData();
    fd.append("paId", data.paId);
    fd.append("tipo", data.tipo);
    if (data.descricaoOutras) fd.append("descricaoOutras", data.descricaoOutras);
    fd.append("gravidade", String(data.gravidade));

    startTransition(async () => {
      const result = isEditing
        ? await updateOcorrenciaAction(ocorrencia.id, analiseId, fd)
        : await createOcorrenciaAction(analiseId, fd);

      if (result.success) {
        onSuccess();
      } else {
        setSubmitError(result.error ?? "Erro ao salvar ocorrência.");
      }
    });
  }

  const gravidadeNum = Number(gravidadeSelecionada);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && <Alert type="error">{submitError}</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Turbina"
          value={`${turbinaCodigo} — ${turbinaNome}`}
          readOnly
          className="bg-gray-50 cursor-default"
        />

        <Select
          label="Pá da Turbina"
          required
          options={paOptions}
          placeholder="Selecione uma pá..."
          {...register("paId")}
          error={errors.paId?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Tipo de Ocorrência"
          required
          options={tipoOptions}
          placeholder="Selecione o tipo..."
          {...register("tipo")}
          error={errors.tipo?.message}
        />

        <div className="flex flex-col gap-1">
          <Select
            label="Gravidade"
            required
            options={gravidadeOptions}
            {...register("gravidade")}
            error={errors.gravidade?.message}
          />
          {gravidadeNum >= 1 && gravidadeNum <= 5 && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-xs text-gray-400">Nível selecionado:</span>
              <Badge className={OCORRENCIA_GRAVIDADE_COLOR[gravidadeNum]}>
                {gravidadeNum} — {OCORRENCIA_GRAVIDADE_LABEL[gravidadeNum]}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {isOutras && (
        <Textarea
          label="Descrição da Ocorrência"
          required
          rows={4}
          placeholder="Descreva a ocorrência específica..."
          {...register("descricaoOutras")}
          error={errors.descricaoOutras?.message}
        />
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Salvar Alterações" : "Registrar Ocorrência"}
        </Button>
      </div>
    </form>
  );
}
