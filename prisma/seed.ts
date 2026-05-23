import { PrismaClient, TurbinaStatus, AnaliseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@powertech.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@powertech.com",
      senha: senhaHash,
    },
  });

  console.log("Usuário criado:", admin.email);

  const turbinas = await Promise.all([
    prisma.turbina.upsert({
      where: { codigo: "TRB-001" },
      update: { dataFabricacao: new Date("2020-08-10") },
      create: {
        nome: "Turbina Alpha",
        codigo: "TRB-001",
        fabricante: "Siemens Gamesa",
        modelo: "SG-5.0-145",
        potencia: 5000,
        dataInstalacao: new Date("2022-03-15"),
        dataFabricacao: new Date("2020-08-10"),
        status: TurbinaStatus.ATIVA,
        observacoes: "Turbina principal do parque eólico norte",
      },
    }),
    prisma.turbina.upsert({
      where: { codigo: "TRB-002" },
      update: { dataFabricacao: new Date("2021-02-20") },
      create: {
        nome: "Turbina Beta",
        codigo: "TRB-002",
        fabricante: "Vestas",
        modelo: "V150-4.5",
        potencia: 4500,
        dataInstalacao: new Date("2022-06-20"),
        dataFabricacao: new Date("2021-02-20"),
        status: TurbinaStatus.ATIVA,
        observacoes: "Segunda turbina do setor leste",
      },
    }),
    prisma.turbina.upsert({
      where: { codigo: "TRB-003" },
      update: { dataFabricacao: new Date("2022-09-05") },
      create: {
        nome: "Turbina Gamma",
        codigo: "TRB-003",
        fabricante: "GE Renewable Energy",
        modelo: "Haliade-X 12MW",
        potencia: 12000,
        dataInstalacao: new Date("2023-01-10"),
        dataFabricacao: new Date("2022-09-05"),
        status: TurbinaStatus.MANUTENCAO,
        observacoes: "Em manutenção preventiva programada",
      },
    }),
  ]);

  console.log(
    "Turbinas criadas:",
    turbinas.map((t) => t.codigo)
  );

  await Promise.all([
    prisma.analise.create({
      data: {
        turbinaId: turbinas[0].id,
        titulo: "Análise Vibração Q1 2025",
        descricao: "Análise de vibração trimestral conforme protocolo técnico",
        resultado: "Níveis dentro dos parâmetros aceitáveis",
        status: AnaliseStatus.CONCLUIDA,
        responsavel: "Eng. Carlos Silva",
        dataAnalise: new Date("2025-01-15"),
      },
    }),
    prisma.analise.create({
      data: {
        turbinaId: turbinas[1].id,
        titulo: "Inspeção Pás Rotor",
        descricao: "Inspeção visual e ultrassônica das pás do rotor",
        status: AnaliseStatus.EM_ANDAMENTO,
        responsavel: "Eng. Maria Santos",
        dataAnalise: new Date("2025-05-10"),
      },
    }),
    prisma.analise.create({
      data: {
        turbinaId: turbinas[2].id,
        titulo: "Diagnóstico Rolamento Principal",
        descricao: "Diagnóstico completo do rolamento principal após alarme",
        status: AnaliseStatus.PENDENTE,
        responsavel: "Eng. João Oliveira",
        dataAnalise: new Date("2025-05-25"),
      },
    }),
  ]);

  console.log("Análises criadas com sucesso");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
