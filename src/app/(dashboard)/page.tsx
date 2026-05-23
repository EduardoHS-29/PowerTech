import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFan,
  faTriangleExclamation,
  faChartBar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentAnalises } from "@/components/dashboard/recent-analises";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { turbinaService } from "@/lib/services/turbina/turbina.service";
import { analiseService } from "@/lib/services/analise/analise.service";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard" };

async function DashboardStats() {
  const [turbinaStats, analiseStats] = await Promise.all([
    turbinaService.getDashboardStats(),
    analiseService.getDashboardStats(),
  ]);

  const totalTurbinas =
    turbinaStats.ATIVA + turbinaStats.INATIVA + turbinaStats.MANUTENCAO;
  const totalAnalises =
    analiseStats.PENDENTE +
    analiseStats.EM_ANDAMENTO +
    analiseStats.CONCLUIDA +
    analiseStats.CANCELADA;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total de Turbinas"
        value={totalTurbinas}
        description={`${turbinaStats.ATIVA} ativas`}
        color="blue"
        icon={<FontAwesomeIcon icon={faFan} className="h-6 w-6" />}
      />
      <StatCard
        title="Em Manutenção"
        value={turbinaStats.MANUTENCAO}
        description="turbinas paradas"
        color="yellow"
        icon={<FontAwesomeIcon icon={faTriangleExclamation} className="h-6 w-6" />}
      />
      <StatCard
        title="Total de Análises"
        value={totalAnalises}
        description={`${analiseStats.CONCLUIDA} concluídas`}
        color="green"
        icon={<FontAwesomeIcon icon={faChartBar} className="h-6 w-6" />}
      />
      <StatCard
        title="Análises Pendentes"
        value={analiseStats.PENDENTE + analiseStats.EM_ANDAMENTO}
        description="aguardando conclusão"
        color="red"
        icon={<FontAwesomeIcon icon={faClock} className="h-6 w-6" />}
      />
    </div>
  );
}

async function RecentAnalisesList() {
  const analises = await analiseService.getRecentForDashboard();
  return <RecentAnalises analises={analises} />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visão geral do sistema PowerTech
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={ROUTES.TURBINAS_NOVO}>
            <Button variant="secondary" size="sm">
              Nova Turbina
            </Button>
          </Link>
          <Link href={ROUTES.ANALISES_NOVO}>
            <Button size="sm">Nova Análise</Button>
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Análises Recentes
            </h2>
            <Link
              href={ROUTES.ANALISES}
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              Ver todas →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="space-y-3 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            }
          >
            <RecentAnalisesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
