import { describe, expect, it, vi } from 'vitest';
import { TicketService } from '../../src/services/ticket-service.js';
import type { TicketRepository } from '../../src/repositories/ticket-repository.js';

describe('servicio aislado mediante un mock', () => {
  it('valida antes de guardar y usa el repositorio inyectado', async () => {
    // vi.fn crea una funcion espia: NO hay conexion con MySQL.
    const crear = vi.fn(async (titulo: string, propietarioId: string) => ({
      id: 1, titulo, propietarioId, estado: 'pendiente' as const,
    }));
    const repo: TicketRepository = {
      crear, obtener: vi.fn(async () => null),
      listar: vi.fn(async () => []), actualizar: vi.fn(async () => null),
    };
    const servicio = new TicketService(repo);

    const resultado = await servicio.crear('  Error de inicio  ', 'u-1');

    expect(resultado.id).toBe(1);
    expect(crear).toHaveBeenCalledOnce();
    expect(crear).toHaveBeenCalledWith('Error de inicio', 'u-1');
  });

  it('no llama al repositorio si el titulo es invalido', async () => {
    const crear = vi.fn();
    const repo: TicketRepository = {
      crear, obtener: vi.fn(async () => null),
      listar: vi.fn(async () => []), actualizar: vi.fn(async () => null),
    };
    const servicio = new TicketService(repo);

    await expect(servicio.crear('x', 'u-1')).rejects.toThrow();
    expect(crear).not.toHaveBeenCalled();
  });
});
