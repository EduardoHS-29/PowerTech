import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ANALISE_STATUS_LABEL, ANALISE_STATUS_COLOR, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AnaliseRow } from "@/lib/repositories/analise/analise.repository";

interface RecentAnalisesProps {
  analises: AnaliseRow[];
}

export function RecentAnalises({ analises }: RecentAnalisesProps) {
  if (analises.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Nenhuma análise registrada ainda.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {analises.map((analise) => (
        <div key={analise.id} className="flex items-center justify-between py-3">
          <div className="min-w-0 flex-1">
            <Link
              href={ROUTES.ANALISE(analise.id)}
              className="block truncate text-sm font-medium text-gray-900 hover:text-primary"
            >
              {analise.titulo}
            </Link>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
              <span>{analise.turbina.codigo}</span>
              <span>·</span>
              <span>{analise.responsavel}</span>
              <span>·</span>
              <span>{formatDate(analise.dataAnalise)}</span>
            </div>
          </div>
          <Badge className={`ml-4 shrink-0 ${ANALISE_STATUS_COLOR[analise.status]}`}>
            {ANALISE_STATUS_LABEL[analise.status]}
          </Badge>
        </div>
      ))}
    </div>
  );
}
