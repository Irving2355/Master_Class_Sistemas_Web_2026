import { AppError, validarEstado, validarTitulo } from '../domain/ticket.js';
import type { Ticket } from '../domain/ticket.js';
import type { TicketRepository } from '../repositories/ticket-repository.js';

export class TicketService {
  // Inyeccion de dependencias: el servicio recibe el repositorio.
  // NO lo crea con "new"; asi una prueba puede sustituirlo.
  constructor(private readonly repo: TicketRepository) {}

  async crear(titulo: unknown, propietarioId: string): Promise<Ticket> {
    // La regla se valida antes de intentar persistir.
    const limpio = validarTitulo(titulo);
    return this.repo.crear(limpio, propietarioId);
  }

  async listar(): Promise<Ticket[]> {
    return this.repo.listar();
  }

  async obtener(id: number): Promise<Ticket> {
    const ticket = await this.repo.obtener(id);
    if (!ticket) throw new AppError(404, 'Ticket no encontrado');
    return ticket;
  }

  async actualizarEstado(id: number, estado: unknown): Promise<Ticket> {
    const valido = validarEstado(estado);
    const ticket = await this.repo.actualizar(id, valido);
    if (!ticket) throw new AppError(404, 'Ticket no encontrado');
    return ticket;
  }
}
