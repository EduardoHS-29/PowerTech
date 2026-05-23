import type { Metadata } from "next";
import Link from "next/link";
import { AnaliseForm } from "@/components/forms/analise-form";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { turbinaService } from "@/lib/services/turbina/turbina.service";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Nova Análise" };

export default async function NovaAnalisePage() {
  const turbinas = await turbinaService.getForSelect();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href={ROUTES.ANALISES} className="hover:text-gray-700">
            Análises
          </Link>
          <span>›</span>
          <span className="text-gray-900">Nova Análise</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Registrar Análise</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registre uma nova análise técnica
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">
            Dados da Análise
          </h2>
        </CardHeader>
        <CardContent>
          <AnaliseForm turbinas={turbinas} />
        </CardContent>
      </Card>
    </div>
  );
}
