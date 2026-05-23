import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TurbinaForm } from "@/components/forms/turbina-form";
import { Card, CardContent } from "@/components/ui/card";
import { turbinaService } from "@/lib/services/turbina/turbina.service";
import { ROUTES } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const turbina = await turbinaService.getById(id);
    return { title: `Editar ${turbina.nome}` };
  } catch {
    return { title: "Turbina não encontrada" };
  }
}

export default async function TurbinaEditarPage({ params }: Props) {
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
          <Link href={ROUTES.TURBINA(id)} className="hover:text-gray-700">
            {turbina.nome}
          </Link>
          <span>›</span>
          <span className="text-gray-900">Editar</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Editar Turbina</h1>
      </div>

      <Card>
        <CardContent>
          <TurbinaForm turbina={turbina} />
        </CardContent>
      </Card>
    </div>
  );
}
