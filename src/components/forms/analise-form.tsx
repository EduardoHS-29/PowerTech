"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { analiseSchema, type AnaliseInput } from "@/lib/validations/analise";
import { createAnaliseAction, updateAnaliseAction } from "@/app/(dashboard)/analises/actions";
import type { AnaliseRow } from "@/lib/repositories/analise/analise.repository";
import { AnaliseStatus } from "@prisma/client";
import { ANALISE_STATUS_LABEL } from "@/lib/constants";
import type { ActionResult } from "@/lib/errors";
import { toDateInputValue } from "@/lib/utils";

const statusOptions = Object.values(AnaliseStatus).map((s) => ({
  value: s,
  label: ANALISE_STATUS_LABEL[s],
}));

interface TurbinaOption {
  id: string;
  nome: string;
  codigo: string;
}

interface AnaliseFormProps {
  analise?: AnaliseRow;
  turbinas: TurbinaOption[];
}

export function AnaliseForm({ analise, turbinas }: AnaliseFormProps) {
  const isEditing = !!analise;
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
          descricao: analise.descricao,
          resultado: analise.resultado ?? "",
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

  return (
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

      <Textarea
        label="Descrição"
        required
        rows={5}
        {...register("descricao")}
        error={errors.descricao?.message ?? fieldError("descricao")}
        placeholder="Descreva o procedimento e objetivo da análise..."
      />

      <Textarea
        label="Resultado"
        rows={4}
        {...register("resultado")}
        error={errors.resultado?.message ?? fieldError("resultado")}
        placeholder="Registre os resultados e conclusões da análise..."
      />

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
  );
}
