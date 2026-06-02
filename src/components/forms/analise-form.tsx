"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { OcorrenciasTable } from "@/components/tables/ocorrencias-table";
import { OcorrenciaForm } from "@/components/forms/ocorrencia-form";
import { analiseSchema, type AnaliseInput } from "@/lib/validations/analise";
import { createAnaliseAction, updateAnaliseAction } from "@/app/(dashboard)/analises/actions";
import type { AnaliseRow } from "@/lib/repositories/analise/analise.repository";
import type { OcorrenciaRow } from "@/lib/repositories/ocorrencia/ocorrencia.repository";
import { AnaliseStatus } from "@prisma/client";
import { ANALISE_STATUS_LABEL } from "@/lib/constants";
import type { ActionResult } from "@/lib/errors";
import { toDateInputValue } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const statusOptions = Object.values(AnaliseStatus).map((s) => ({
  value: s,
  label: ANALISE_STATUS_LABEL[s],
}));

interface TurbinaOption {
  id: string;
  nome: string;
  codigo: string;
}

interface PaOption {
  id: string;
  codigo: string;
  ordem: number;
}

interface AnaliseFormProps {
  analise?: AnaliseRow;
  turbinas: TurbinaOption[];
  turbinaPas?: PaOption[];
  ocorrencias?: OcorrenciaRow[];
}

export function AnaliseForm({
  analise,
  turbinas,
  turbinaPas = [],
  ocorrencias = [],
}: AnaliseFormProps) {
  const isEditing = !!analise;
  const router = useRouter();

  const action = isEditing
    ? updateAnaliseAction.bind(null, analise.id)
    : createAnaliseAction;

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  const {
    register,
    control,
    formState: { errors },
  } = useForm<AnaliseInput>({
    resolver: zodResolver(analiseSchema),
    defaultValues: analise
      ? {
          turbinaId: analise.turbinaId,
          titulo: analise.titulo,
          status: analise.status,
          responsavel: analise.responsavel,
          dataAnalise: toDateInputValue(analise.dataAnalise),
          observacoes: analise.observacoes ?? "",
        }
      : { status: AnaliseStatus.PENDENTE },
  });

  const fieldError = (field: string): string | undefined =>
    state && !state.success ? state.fieldErrors?.[field]?.[0] : undefined;

  const turbinaOptions = turbinas.map((t) => ({
    value: t.id,
    label: `[${t.codigo}] ${t.nome}`,
  }));

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOcorrencia, setEditingOcorrencia] = useState<OcorrenciaRow | null>(null);

  function handleOpenCreate() {
    setEditingOcorrencia(null);
    setModalOpen(true);
  }

  function handleOpenEdit(oc: OcorrenciaRow) {
    setEditingOcorrencia(oc);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingOcorrencia(null);
  }

  function handleModalSuccess() {
    handleModalClose();
    router.refresh();
  }

  return (
    <>
      <form action={formAction} className="space-y-6">
        {state && !state.success && !state.fieldErrors && (
          <Alert type="error">{state.error}</Alert>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Select
              label="Turbina"
              required
              options={turbinaOptions}
              placeholder="Selecione uma turbina..."
              {...register("turbinaId")}
              error={errors.turbinaId?.message ?? fieldError("turbinaId")}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Título"
              required
              {...register("titulo")}
              error={errors.titulo?.message ?? fieldError("titulo")}
              placeholder="Ex: Análise de vibração Q1 2025"
            />
          </div>

          <Input
            label="Responsável"
            required
            {...register("responsavel")}
            error={errors.responsavel?.message ?? fieldError("responsavel")}
            placeholder="Nome do engenheiro responsável"
          />

          <DateInput
            name="dataAnalise"
            control={control}
            label="Data da Análise"
            format="dd/MM/yyyy"
            required
            error={errors.dataAnalise?.message ?? fieldError("dataAnalise")}
          />

          <Select
            label="Status"
            required
            options={statusOptions}
            {...register("status")}
            error={errors.status?.message ?? fieldError("status")}
          />
        </div>

      {isEditing && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Ocorrências
            </h3>
            <Button type="button" size="sm" onClick={handleOpenCreate}>
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
              Adicionar
            </Button>
          </div>

          <OcorrenciasTable
            ocorrencias={ocorrencias}
            analiseId={analise.id}
            onEdit={handleOpenEdit}
            onDeleted={() => router.refresh()}
          />
        </div>
      )}

        <Textarea
          label="Observações"
          rows={3}
          {...register("observacoes")}
          error={errors.observacoes?.message ?? fieldError("observacoes")}
          placeholder="Observações adicionais..."
        />

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" loading={isPending}>
            {isEditing ? "Salvar Alterações" : "Registrar Análise"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        title={editingOcorrencia ? "Editar Ocorrência" : "Nova Ocorrência"}
        size="xl"
        disableClose={false}
      >
        {analise && (
          <OcorrenciaForm
            analiseId={analise.id}
            turbinaCodigo={analise.turbina.codigo}
            turbinaNome={analise.turbina.nome}
            pas={turbinaPas}
            ocorrencia={editingOcorrencia}
            onSuccess={handleModalSuccess}
            onCancel={handleModalClose}
          />
        )}
      </Modal>
    </>
  );
}
