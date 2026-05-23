import type { Metadata } from "next";
import Link from "next/link";
import { TurbinaForm } from "@/components/forms/turbina-form";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Nova Turbina" };

export default function NovaTurbinaPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href={ROUTES.TURBINAS} className="hover:text-gray-700">
            Turbinas
          </Link>
          <span>›</span>
          <span className="text-gray-900">Nova Turbina</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Cadastrar Turbina</h1>
        <p className="mt-1 text-sm text-gray-500">
          Preencha os dados da nova turbina do parque
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">
            Dados da Turbina
          </h2>
        </CardHeader>
        <CardContent>
          <TurbinaForm />
        </CardContent>
      </Card>
    </div>
  );
}
