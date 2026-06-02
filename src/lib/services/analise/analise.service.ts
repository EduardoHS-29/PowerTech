import { analiseRepository } from "@/lib/repositories/analise/analise.repository";
import { turbinaRepository } from "@/lib/repositories/turbina/turbina.repository";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { AnaliseFilters, PaginationParams } from "@/lib/types";
import type { AnaliseInput } from "@/lib/validations/analise";

export const analiseService = {
  async list(filters: AnaliseFilters, pagination: PaginationParams) {
    return analiseRepository.findMany(filters, pagination);
  },

  async getById(id: string) {
    const analise = await analiseRepository.findById(id);
    if (!analise) throw new NotFoundError("Análise");
    return analise;
  },

  async create(data: AnaliseInput) {
    const turbina = await turbinaRepository.findById(data.turbinaId);
    if (!turbina) throw new ValidationError("Turbina não encontrada");
    return analiseRepository.create(data);
  },

  async update(id: string, data: Partial<AnaliseInput>) {
    await this.getById(id);

    if (data.turbinaId) {
      const turbina = await turbinaRepository.findById(data.turbinaId);
      if (!turbina) throw new ValidationError("Turbina não encontrada");
    }

    return analiseRepository.update(id, data);
  },

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await analiseRepository.delete(id);
  },

  async getRecentForDashboard() {
    return analiseRepository.findRecentWithGravidade(5);
  },

  async getDashboardStats() {
    return analiseRepository.countByStatus();
  },
};
