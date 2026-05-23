import { prisma } from "@/lib/db/prisma";
import type { User } from "@prisma/client";
import type { SafeUser } from "@/lib/types";

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
