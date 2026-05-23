import { userRepository } from "@/lib/repositories/auth/user.repository";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/errors";
import type { LoginInput } from "@/lib/validations/auth";
import type { SessionPayload } from "@/lib/auth/session";

export const authService = {
  async login(input: LoginInput): Promise<void> {
    const user = await userRepository.findByEmail(input.email);

    if (!user || !user.ativo) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const passwordValid = await verifyPassword(input.senha, user.senha);
    if (!passwordValid) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    await createSession({
      userId: user.id,
      email: user.email,
      nome: user.nome,
    });
  },

  async logout(): Promise<void> {
    await deleteSession();
  },

  async getCurrentSession(): Promise<SessionPayload | null> {
    return getSession();
  },

  async requireSession(): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) {
      throw new UnauthorizedError();
    }
    return session;
  },
};
