import { prisma } from "./prisma";
import type { PrismaClient } from "@prisma/client";

type TransactionClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}
