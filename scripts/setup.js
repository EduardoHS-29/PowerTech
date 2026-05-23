#!/usr/bin/env node
'use strict';

/**
 * PowerTech — Setup Inicial
 *
 * Configura o projeto do zero: dependências, banco de dados, migrations e seed.
 * Uso: npm run setup
 */

const { execSync, spawnSync } = require('child_process');
const { existsSync, readFileSync, copyFileSync } = require('fs');
const { join } = require('path');
const readline = require('readline');

const ROOT = join(__dirname, '..');

// ─── Utilitários de output ────────────────────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
};

const log = {
  step:  (msg) => console.log(`\n${C.cyan}${C.bold}▸ ${msg}${C.reset}`),
  ok:    (msg) => console.log(`${C.green}  ✓ ${msg}${C.reset}`),
  warn:  (msg) => console.log(`${C.yellow}  ⚠ ${msg}${C.reset}`),
  error: (msg) => console.log(`${C.red}  ✗ ${msg}${C.reset}`),
  info:  (msg) => console.log(`${C.gray}    ${msg}${C.reset}`),
  blank: ()    => console.log(),
};

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
}

function trySpawn(bin, args, extraEnv = {}) {
  const result = spawnSync(bin, args, {
    env: { ...process.env, ...extraEnv },
    stdio: 'pipe',
    cwd: ROOT,
  });
  return result.status === 0;
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const { createInterface } = readline;

// ─── Parser de DATABASE_URL ───────────────────────────────────────────────────

function parseDbUrl(url) {
  // mysql://user:pass@host:port/dbname
  const match = url.match(/^mysql:\/\/([^:]+):([^@]*)@([^:/]+):(\d+)\/([^?]+)/);
  if (!match) return null;
  const [, user, pass, host, port, dbName] = match;
  return { user, pass: decodeURIComponent(pass), host, port, dbName };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async function main() {
  console.log(`\n${C.cyan}${C.bold}╔═══════════════════════════════════════╗
║      PowerTech — Setup Inicial        ║
╚═══════════════════════════════════════╝${C.reset}`);

  // ── 1. Verificar Node.js ──────────────────────────────────────────────────
  log.step('Verificando Node.js...');
  const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
  if (nodeMajor < 20 || (nodeMajor === 20 && nodeMinor < 9)) {
    log.error(`Node.js ${process.version} não suportado. Mínimo: v20.9.0`);
    log.info('Use nvm para instalar: nvm install 20 && nvm use 20');
    process.exit(1);
  }
  log.ok(`Node.js ${process.version}`);

  // ── 2. Verificar/criar .env ───────────────────────────────────────────────
  log.step('Verificando .env...');
  const envPath        = join(ROOT, '.env');
  const envExamplePath = join(ROOT, '.env.example');

  if (!existsSync(envPath)) {
    if (!existsSync(envExamplePath)) {
      log.error('.env.example não encontrado. Repositório pode estar incompleto.');
      process.exit(1);
    }
    copyFileSync(envExamplePath, envPath);
    log.warn('.env criado a partir de .env.example');
    log.blank();
    log.info(`Edite o arquivo abaixo com suas credenciais do MySQL:`);
    log.info(`  ${envPath}`);
    log.blank();
    log.info('Depois execute o setup novamente: npm run setup');
    process.exit(0);
  }
  log.ok('.env encontrado');

  // ── 3. Ler DATABASE_URL ───────────────────────────────────────────────────
  log.step('Lendo configurações do banco de dados...');
  const envContent = readFileSync(envPath, 'utf-8');
  const urlMatch   = envContent.match(/^DATABASE_URL="([^"]+)"/m);

  if (!urlMatch) {
    log.error('DATABASE_URL não encontrada no .env');
    log.info('Formato esperado: DATABASE_URL="mysql://user:senha@localhost:3306/powertech"');
    process.exit(1);
  }

  const db = parseDbUrl(urlMatch[1]);
  if (!db) {
    log.error('Formato de DATABASE_URL inválido.');
    log.info('Esperado: mysql://usuario:senha@host:porta/nome_banco');
    process.exit(1);
  }

  log.ok(`Banco: ${C.reset}${db.dbName}${C.gray} em ${db.host}:${db.port} (usuário: ${db.user})`);

  // ── 4. Instalar dependências ──────────────────────────────────────────────
  log.step('Instalando dependências npm...');
  try {
    run('npm install');
    log.ok('Dependências instaladas');
  } catch {
    log.error('npm install falhou. Verifique sua conexão e tente novamente.');
    process.exit(1);
  }

  // ── 5. Criar banco de dados ───────────────────────────────────────────────
  log.step(`Criando banco de dados "${db.dbName}" (se não existir)...`);

  const createSql = `CREATE DATABASE IF NOT EXISTS \`${db.dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
  const mysqlArgs = [
    '-h', db.host,
    '-P', db.port,
    '-u', db.user,
    '--connect-timeout=5',
    '-e', createSql,
  ];
  const mysqlEnv = db.pass ? { MYSQL_PWD: db.pass } : {};

  // Tenta 'mysql' (geralmente disponível junto com o servidor MySQL)
  const dbCreated = trySpawn('mysql', mysqlArgs, mysqlEnv);

  if (dbCreated) {
    log.ok(`Banco de dados "${db.dbName}" pronto`);
  } else {
    log.warn('Não foi possível criar o banco automaticamente.');
    log.info('Isso pode ocorrer se o MySQL CLI não estiver no PATH ou as credenciais estiverem incorretas.');
    log.blank();
    log.info('Crie o banco manualmente executando no MySQL:');
    log.info(`  ${createSql}`);
    log.blank();
    await ask(`${C.yellow}  Pressione Enter quando o banco de dados estiver criado...${C.reset} `);
  }

  // ── 6. Gerar Prisma Client ────────────────────────────────────────────────
  log.step('Gerando Prisma Client...');
  try {
    run('npx prisma generate');
    log.ok('Prisma Client gerado');
  } catch {
    log.error('Falha ao gerar o Prisma Client.');
    process.exit(1);
  }

  // ── 7. Executar migrations ────────────────────────────────────────────────
  log.step('Executando migrations...');
  const migrationsDir = join(ROOT, 'prisma', 'migrations');
  const migrationCmd  = existsSync(migrationsDir)
    ? 'npx prisma migrate dev'
    : 'npx prisma migrate dev --name init';

  try {
    run(migrationCmd);
    log.ok('Migrations aplicadas');
  } catch {
    log.error('Falha ao executar migrations.');
    log.info('Verifique se o banco de dados existe e as credenciais no .env estão corretas.');
    log.info(`DATABASE_URL atual: ${urlMatch[1]}`);
    process.exit(1);
  }

  // ── 8. Seed ───────────────────────────────────────────────────────────────
  log.step('Inserindo dados iniciais (seed)...');
  try {
    run('npx tsx prisma/seed.ts');
    log.ok('Dados iniciais inseridos');
  } catch {
    log.error('Falha ao executar o seed.');
    log.info('O banco de dados foi criado, mas sem dados iniciais.');
    log.info('Tente manualmente: npm run db:seed');
  }

  // ── Concluído ─────────────────────────────────────────────────────────────
  console.log(`
${C.green}${C.bold}╔═══════════════════════════════════════╗
║     ✓ Setup concluído com sucesso!    ║
╚═══════════════════════════════════════╝${C.reset}

${C.bold}  Credenciais de acesso:${C.reset}
  URL:    ${C.cyan}http://localhost:3000${C.reset}
  E-mail: ${C.cyan}admin@powertech.com${C.reset}
  Senha:  ${C.cyan}admin123${C.reset}

${C.bold}  Próximo passo:${C.reset}
  ${C.cyan}npm run dev${C.reset}
`);
})().catch((err) => {
  log.blank();
  log.error(`Erro inesperado: ${err.message}`);
  process.exit(1);
});
