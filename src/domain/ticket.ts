// El dominio NO conoce Express, HTTP, SQL ni Vitest.
// Por ello podemos probar estas reglas sin levantar un servidor.
export type EstadoTicket = 'pendiente' | 'resuelto';

export interface Ticket {
  id: number;
  titulo: string;
  estado: EstadoTicket;
  propietarioId: string;
}

// Error deliberado del dominio con codigo HTTP sugerido.
// La capa HTTP decidira como transformar el error en una respuesta.
export class AppError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function validarTitulo(entrada: unknown): string {
  // En HTTP nunca asumimos que el JSON recibido tiene un tipo correcto.
  if (typeof entrada !== 'string') {
    throw new AppError(400, 'El titulo debe ser texto');
  }
  const titulo = entrada.trim();
  // Se validan limites concretos para evitar datos vacios o enormes.
  if (titulo.length < 3 || titulo.length > 80) {
    throw new AppError(400, 'El titulo debe tener entre 3 y 80 caracteres');
  }
  return titulo;
}

export function validarEstado(entrada: unknown): EstadoTicket {
  if (entrada !== 'pendiente' && entrada !== 'resuelto') {
    throw new AppError(400, 'Estado no valido');
  }
  return entrada;
}
