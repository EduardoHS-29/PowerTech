import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { analiseService } from "@/lib/services/analise/analise.service";
import { ocorrenciaService } from "@/lib/services/ocorrencia/ocorrencia.service";
import {
  ANALISE_STATUS_LABEL,
  ANALISE_STATUS_COLOR,
  OCORRENCIA_GRAVIDADE_COLOR,
  OCORRENCIA_GRAVIDADE_LABEL,
  ROUTES,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface AnaliseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AnaliseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const analise = await analiseService.getById(id);
    return { title: `${analise.titulo} — Análise` };
  } catch {
    return { title: "Análise não encontrada" };
  }
}

export default async function AnaliseDetailPage({
  params,
}: AnaliseDetailPageProps) {
  const { id } = await params;

  let analise;
  try {
    analise = await analiseService.getById(id);
  } catch {
    notFound();
  }

  const ocorrencias = await ocorrenciaService.listByAnalise(id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href={ROUTES.ANALISES} className="hover:text-gray-700">
            Análises
          </Link>
          <span>›</span>
          <span className="text-gray-900">{analise.titulo}</span>
        </nav>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{analise.titulo}</h1>
            <div className="mt-1 flex items-center gap-3">
              <Link
                href={ROUTES.TURBINA(analise.turbinaId)}
                className="font-mono text-sm text-blue-600 hover:underline"
              >
                {analise.turbina.codigo} — {analise.turbina.nome}
              </Link>
              <Badge className={ANALISE_STATUS_COLOR[analise.status]}>
                {ANALISE_STATUS_LABEL[analise.status]}
              </Badge>
            </div>
          </div>
          <Link
            href={ROUTES.ANALISE_EDITAR(id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Responsável", value: analise.responsavel },
          { label: "Data da Análise", value: formatDate(analise.dataAnalise) },
          { label: "Criado em", value: formatDate(analise.createdAt) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {analise.observacoes && (
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Observações
            </p>
            <p className="mt-2 text-sm text-gray-700">{analise.observacoes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-4">
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">
            Ocorrências
          </p>

          {ocorrencias.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">
              Nenhuma ocorrência registrada.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-medium text-gray-600">
                      Tipo de Ocorrência
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-600">
                      Cód. da Pá
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-600">
                      Gravidade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ocorrencias.map((oc) => {
                    const tipoLabel =
                      oc.tipo === "Outras" && oc.descricaoOutras
                        ? oc.descricaoOutras
                        : oc.tipo;
                    return (
                      <tr key={oc.id} className="hover:bg-gray-50">
                        <td className="max-w-xs px-4 py-3">
                          <span className="line-clamp-2 text-gray-700">
                            {tipoLabel}
                          </span>
                          {oc.tipo === "Outras" && oc.descricaoOutras && (
                            <span className="text-xs text-gray-400">Outras</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-medium text-gray-700">
                            {oc.pa.codigo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={OCORRENCIA_GRAVIDADE_COLOR[oc.gravidade]}>
                            {oc.gravidade} —{" "}
                            {OCORRENCIA_GRAVIDADE_LABEL[oc.gravidade]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
