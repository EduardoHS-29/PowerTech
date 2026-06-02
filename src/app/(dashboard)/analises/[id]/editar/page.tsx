import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnaliseForm } from "@/components/forms/analise-form";
import { Card, CardContent } from "@/components/ui/card";
import { analiseService } from "@/lib/services/analise/analise.service";
import { turbinaService } from "@/lib/services/turbina/turbina.service";
import { turbinaRepository } from "@/lib/repositories/turbina/turbina.repository";
import { ocorrenciaService } from "@/lib/services/ocorrencia/ocorrencia.service";
import { ROUTES } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const analise = await analiseService.getById(id);
    return { title: `Editar ${analise.titulo}` };
  } catch {
    return { title: "Análise não encontrada" };
  }
}

export default async function AnaliseEditarPage({ params }: Props) {
  const { id } = await params;
  let analise;

  try {
    analise = await analiseService.getById(id);
  } catch {
    notFound();
  }

  const [turbinas, turbina, ocorrencias] = await Promise.all([
    turbinaService.getForSelect(),
    turbinaRepository.findById(analise.turbinaId),
    ocorrenciaService.listByAnalise(id),
  ]);

  const turbinaPas = (turbina?.pas ?? []).map((p) => ({
    id: p.id,
    codigo: p.codigo,
    ordem: p.ordem,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href={ROUTES.ANALISES} className="hover:text-gray-700">
            Análises
          </Link>
          <span>›</span>
          <Link href={ROUTES.ANALISE(id)} className="hover:text-gray-700">
            {analise.titulo}
          </Link>
          <span>›</span>
          <span className="text-gray-900">Editar</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Editar Análise</h1>
      </div>

      <Card>
        <CardContent>
          <AnaliseForm
            analise={analise}
            turbinas={turbinas}
            turbinaPas={turbinaPas}
            ocorrencias={ocorrencias}
          />
        </CardContent>
      </Card>
    </div>
  );
}
