import { ocorrenciaRepository } from "@/lib/repositories/ocorrencia/ocorrencia.repository";
import { analiseRepository } from "@/lib/repositories/analise/analise.repository";
import { turbinaRepository } from "@/lib/repositories/turbina/turbina.repository";
import { NotFoundError } from "@/lib/errors";
import type { OcorrenciaParsed } from "@/lib/validations/ocorrencia";

export const ocorrenciaService = {
  async listByAnalise(analiseId: string) {
    return ocorrenciaRepository.findByAnalise(analiseId);
  },

  async create(analiseId: string, data: OcorrenciaParsed) {
    const analise = await analiseRepository.findById(analiseId);
    if (!analise) throw new NotFoundError("Análise");

    const ocorrencia = await ocorrenciaRepository.create(analiseId, data);

    await turbinaRepository.updatePaDataUltimaAnalise(
      data.paId,
      analise.dataAnalise
    );

    return ocorrencia;
  },

  async update(id: string, data: Partial<OcorrenciaParsed>) {
    const ocorrencia = await ocorrenciaRepository.findById(id);
    if (!ocorrencia) throw new NotFoundError("Ocorrência");

    const updated = await ocorrenciaRepository.update(id, data);

    // Atualiza a pá afetada (nova paId se alterada, ou a original)
    const paId = data.paId ?? ocorrencia.paId;
    const analise = await analiseRepository.findById(ocorrencia.analiseId);
    if (analise) {
      await turbinaRepository.updatePaDataUltimaAnalise(paId, analise.dataAnalise);
    }

    return updated;
  },

  async delete(id: string): Promise<void> {
    const ocorrencia = await ocorrenciaRepository.findById(id);
    if (!ocorrencia) throw new NotFoundError("Ocorrência");
    await ocorrenciaRepository.delete(id);
  },
};
