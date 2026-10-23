import type { Ticket, EstadoTicket } from '../domain/ticket.js';

// "Contrato": servicio sabe QUE puede pedir, no COMO se almacena.
export interface TicketRepository {
  crear(titulo: string, propietarioId: string): Promise<Ticket>;
  obtener(id: number): Promise<Ticket | null>;
  listar(): Promise<Ticket[]>;
  actualizar(id: number, estado: EstadoTicket): Promise<Ticket | null>;
}

// Adaptador en memoria: reemplazable por MySQL2 o Sequelize.
// Usamos copias para evitar que otro componente modifique el arreglo.
export class MemoryTicketRepository implements TicketRepository {
  private secuencia = 1;
  private readonly datos: Ticket[] = [];

  async crear(titulo: string, propietarioId: string): Promise<Ticket> {
    const ticket: Ticket = {
      id: this.secuencia++, titulo, estado: 'pendiente', propietarioId,
    };
    this.datos.push(ticket);
    return { ...ticket };
  }

  async obtener(id: number): Promise<Ticket | null> {
    const encontrado = this.datos.find((t) => t.id === id);
    return encontrado ? { ...encontrado } : null;
  }

  async listar(): Promise<Ticket[]> {
    return this.datos.map((t) => ({ ...t }));
  }

  async actualizar(id: number, estado: EstadoTicket): Promise<Ticket | null> {
    const ticket = this.datos.find((t) => t.id === id);
    if (!ticket) return null;
    ticket.estado = estado;
    return { ...ticket };
  }
}
