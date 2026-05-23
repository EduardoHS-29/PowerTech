import { turbinaRepository } from "@/lib/repositories/turbina/turbina.repository";
import { NotFoundError, ConflictError } from "@/lib/errors";
import type { TurbinaFilters, PaginationParams } from "@/lib/types";
import type { TurbinaParsed } from "@/lib/validations/turbina";

export const turbinaService = {
  async list(filters: TurbinaFilters, pagination: PaginationParams) {
    return turbinaRepository.findMany(filters, pagination);
  },

  async getById(id: string) {
    const turbina = await turbinaRepository.findById(id);
    if (!turbina) throw new NotFoundError("Turbina");
    return turbina;
  },

  async getForSelect() {
    return turbinaRepository.findAllForSelect();
  },

  async create(data: TurbinaParsed) {
    const existing = await turbinaRepository.findByCodigo(data.codigo);
    if (existing) {
      throw new ConflictError(`Já existe uma turbina com o código ${data.codigo}`);
    }
    return turbinaRepository.create(data);
  },

  async update(id: string, data: Partial<TurbinaParsed>) {
    await this.getById(id);

    if (data.codigo) {
      const existing = await turbinaRepository.findByCodigo(data.codigo);
      if (existing && existing.id !== id) {
        throw new ConflictError(
          `Já existe uma turbina com o código ${data.codigo}`
        );
      }
    }

    return turbinaRepository.update(id, data);
  },

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await turbinaRepository.delete(id);
  },

  async getDashboardStats() {
    return turbinaRepository.countByStatus();
  },
};
