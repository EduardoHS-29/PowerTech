import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { turbinaService } from "@/lib/services/turbina/turbina.service";
import {
  TURBINA_STATUS_LABEL,
  TURBINA_STATUS_COLOR,
  ROUTES,
} from "@/lib/constants";
import { formatDate, formatPotencia } from "@/lib/utils";

interface TurbinaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TurbinaDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const turbina = await turbinaService.getById(id);
    return { title: `${turbina.nome} — Turbina` };
  } catch {
    return { title: "Turbina não encontrada" };
  }
}

export default async function TurbinaDetailPage({
  params,
}: TurbinaDetailPageProps) {
  const { id } = await params;
  let turbina;

  try {
    turbina = await turbinaService.getById(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href={ROUTES.TURBINAS} className="hover:text-gray-700">
            Turbinas
          </Link>
          <span>›</span>
          <span className="text-gray-900">{turbina.nome}</span>
        </nav>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{turbina.nome}</h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-sm text-gray-500">
                {turbina.codigo}
              </span>
              <Badge className={TURBINA_STATUS_COLOR[turbina.status]}>
                {TURBINA_STATUS_LABEL[turbina.status]}
              </Badge>
            </div>
          </div>
          <Link
            href={ROUTES.TURBINA_EDITAR(id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Fabricante", value: turbina.fabricante },
          { label: "Modelo", value: turbina.modelo },
          { label: "Potência", value: formatPotencia(turbina.potencia) },
          { label: "Instalação", value: formatDate(turbina.dataInstalacao) },
          { label: "Fabricação", value: formatDate(turbina.dataFabricacao) },
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

      {turbina.pas.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">Pás da Turbina</h2>
          </CardHeader>
          <div className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Pá</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Código</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Modelo</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Últ. Análise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...turbina.pas]
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((pa) => (
                    <tr key={pa.id}>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {pa.ordem === 1 ? "1ª" : pa.ordem === 2 ? "2ª" : "3ª"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">
                        {pa.codigo}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{pa.modelo}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {pa.dataUltimaAnalise ? formatDate(pa.dataUltimaAnalise) : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {turbina.observacoes && (
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Observações
            </p>
            <p className="mt-2 text-sm text-gray-700">{turbina.observacoes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
