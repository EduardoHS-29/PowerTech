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
import { turbinaSchema } from "@/lib/validations/turbina";
import type { z } from "zod";

type TurbinaFormData = z.input<typeof turbinaSchema>;
import { createTurbinaAction, updateTurbinaAction } from "@/app/(dashboard)/turbinas/actions";
import type { TurbinaRow } from "@/lib/repositories/turbina/turbina.repository";
import { TurbinaStatus } from "@prisma/client";
import { TURBINA_STATUS_LABEL } from "@/lib/constants";
import type { ActionResult } from "@/lib/errors";
import { toDateInputValue } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusOptions = Object.values(TurbinaStatus).map((s) => ({
  value: s,
  label: TURBINA_STATUS_LABEL[s],
}));

const PA_LABELS = ["1ª", "2ª", "3ª"];

const DEFAULT_PAS: TurbinaFormData["pas"] = [
  { codigo: "", modelo: "", dataUltimaAnalise: "" },
  { codigo: "", modelo: "", dataUltimaAnalise: "" },
  { codigo: "", modelo: "", dataUltimaAnalise: "" },
];

interface TurbinaFormProps {
  turbina?: TurbinaRow;
}

export function TurbinaForm({ turbina }: TurbinaFormProps) {
  const isEditing = !!turbina;
  const action = isEditing
    ? updateTurbinaAction.bind(null, turbina.id)
    : createTurbinaAction;

  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    action,
    null
  );

  const sortedPas = turbina?.pas
    ? [...turbina.pas].sort((a, b) => a.ordem - b.ordem)
    : null;

  const {
    register,
    control,
    formState: { errors },
  } = useForm<TurbinaFormData>({
    resolver: zodResolver(turbinaSchema),
    defaultValues: turbina
      ? {
          nome: turbina.nome,
          codigo: turbina.codigo,
          fabricante: turbina.fabricante,
          modelo: turbina.modelo,
          potencia: turbina.potencia,
          dataInstalacao: toDateInputValue(turbina.dataInstalacao),
          dataFabricacao: toDateInputValue(turbina.dataFabricacao),
          status: turbina.status,
          observacoes: turbina.observacoes ?? "",
          pas: sortedPas?.length === 3
            ? sortedPas.map((pa) => ({
                codigo: pa.codigo,
                modelo: pa.modelo,
                dataUltimaAnalise: pa.dataUltimaAnalise
                  ? toDateInputValue(pa.dataUltimaAnalise)
                  : "",
                }))
            : DEFAULT_PAS,
        }
      : { status: TurbinaStatus.ATIVA, pas: DEFAULT_PAS },
  });

  const fieldError = (field: string): string | undefined =>
    state && !state.success ? state.fieldErrors?.[field]?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && !state.fieldErrors && (
        <Alert type="error">{state.error}</Alert>
      )}

      {/* Identificação */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nome"
          required
          {...register("nome")}
          error={errors.nome?.message ?? fieldError("nome")}
        />
        <Input
          label="Código"
          required
          {...register("codigo")}
          error={errors.codigo?.message ?? fieldError("codigo")}
          hint="Ex: TRB-001 — será convertido para maiúsculas"
        />
        <Input
          label="Fabricante"
          required
          {...register("fabricante")}
          error={errors.fabricante?.message ?? fieldError("fabricante")}
        />
        <Input
          label="Modelo"
          required
          {...register("modelo")}
          error={errors.modelo?.message ?? fieldError("modelo")}
        />
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateInput
          name="dataInstalacao"
          control={control}
          label="Data de Instalação"
          format="dd/MM/yyyy"
          required
          error={errors.dataInstalacao?.message ?? fieldError("dataInstalacao")}
        />
        <DateInput
          name="dataFabricacao"
          control={control}
          label="Data de Fabricação"
          format="dd/MM/yyyy"
          required
          error={errors.dataFabricacao?.message ?? fieldError("dataFabricacao")}
        />
      </div>

      {/* Potência e Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Potência (kW)"
          type="number"
          required
          step="0.1"
          min="0"
          {...register("potencia")}
          error={errors.potencia?.message ?? fieldError("potencia")}
        />
        <Select
          label="Status"
          required
          options={statusOptions}
          {...register("status")}
          error={errors.status?.message ?? fieldError("status")}
        />
      </div>

      {/* Pás da Turbina */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Pás da Turbina</h3>
          <p className="text-xs text-gray-500">Informe os dados das três pás da turbina eólica</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          {/* Header */}
          <div className="grid grid-cols-[3rem_1fr_1fr_9rem] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2">
            <span className="text-xs font-medium text-gray-500">Pá</span>
            <span className="text-xs font-medium text-gray-500">Código *</span>
            <span className="text-xs font-medium text-gray-500">Modelo *</span>
            <span className="text-xs font-medium text-gray-500">Últ. Análise</span>
          </div>

          {/* Rows */}
          {PA_LABELS.map((label, i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[3rem_1fr_1fr_9rem] items-center gap-3 px-4 py-3",
                  i < 2 && "border-b border-gray-100"
                )}
              >
                <span className="text-sm font-semibold text-gray-700">{label}</span>

                <input
                  type="text"
                  {...register(`pas.${i}.codigo` as const)}
                  placeholder="Ex: PA-001"
                  className={cn(
                    "block w-full rounded-md border px-2.5 py-1.5 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary focus:ring-primary/20",
                    errors.pas?.[i]?.codigo
                      ? "border-red-300"
                      : "border-gray-300"
                  )}
                />

                <input
                  type="text"
                  {...register(`pas.${i}.modelo` as const)}
                  placeholder="Ex: FRP-1500"
                  className={cn(
                    "block w-full rounded-md border px-2.5 py-1.5 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary focus:ring-primary/20",
                    errors.pas?.[i]?.modelo
                      ? "border-red-300"
                      : "border-gray-300"
                  )}
                />

                <DateInput
                  name={`pas.${i as 0 | 1 | 2}.dataUltimaAnalise`}
                  control={control}
                  format="dd/MM/yyyy"
                  compact
                />
              </div>
          ))}
        </div>

        {/* Erros globais de pás */}
        {(errors.pas?.[0]?.codigo || errors.pas?.[1]?.codigo || errors.pas?.[2]?.codigo ||
          errors.pas?.[0]?.modelo || errors.pas?.[1]?.modelo || errors.pas?.[2]?.modelo) && (
          <p className="text-xs text-red-600">Preencha o código e o modelo de todas as pás</p>
        )}
      </div>

      {/* Observações */}
      <Textarea
        label="Observações"
        rows={4}
        {...register("observacoes")}
        error={errors.observacoes?.message ?? fieldError("observacoes")}
        placeholder="Informações adicionais sobre a turbina..."
      />

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" loading={isPending}>
          {isEditing ? "Salvar Alterações" : "Cadastrar Turbina"}
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
