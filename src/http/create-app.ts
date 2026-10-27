import express, { type ErrorRequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AppError } from '../domain/ticket.js';
import type { TicketService } from '../services/ticket-service.js';
import type { TokenProvider } from '../auth/token-provider.js';
import { autenticar, exigirRol } from './auth-middleware.js';

export interface AppOptions {
  service: TicketService;
  tokens: TokenProvider;
  limite?: number; // Opcional para la practica controlada.
}

export function crearApp({ service, tokens, limite = 100 }: AppOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  // Limitador de memoria: adecuado para demostrar, no para distribuir
  // limites entre multiples procesos. Revisar trust proxy en despliegue.
  app.use('/api', rateLimit({
    rateLimit({
    // Tiempo durante el cual contamos las solicitudes.
    // La unidad son MILISEGUNDOS.
    windowMs: 60_000,

    // Cantidad maxima de solicitudes permitidas
    // para cada cliente durante esa ventana.
    limit: limite,

    // Enviar informacion del limite mediante
    // encabezados HTTP del formato draft-8.
    standardHeaders: 'draft-8',

    // No enviar los encabezados antiguos
    // X-RateLimit-*.
    legacyHeaders: false,
  }));

  app.get('/api/salud', (_req, res) => res.json({ ok: true }));

  // GET publico: demuestra la diferencia con rutas protegidas.
  app.get('/api/tickets', async (_req, res) => {
    const tickets = await service.listar();
    res.json({ data: tickets });
  });

  // POST protegido: requiere identidad Y el rol profesor.
  app.post('/api/tickets', autenticar(tokens), exigirRol('profesor'),
    async (req, res) => {
      // req.body es entrada NO confiable: el servicio valida titulo.
      const titulo: unknown = req.body?.titulo;
      const ticket = await service.crear(titulo, req.usuario!.id);
      res.status(201).json({ data: ticket });
    });

  // La ID obtenida por la URL puede ser invalida o no existir.
  app.get('/api/tickets/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError(400, 'ID invalido');
    }
    const ticket = await service.obtener(id);
    res.json({ data: ticket });
  });

  // Este ejemplo no expone cambios de estado desde el cliente; la
  // operacion de servicio se ejercita en pruebas y puede agregarse.

  // Un middleware de errores de Express debe tener CUATRO argumentos.
  const errores: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
    const esControlado = err instanceof AppError;
    const status = esControlado ? err.status : 500;
    const mensaje = esControlado ? err.message : 'Error interno';
    // En una app real registrar internamente errores inesperados,
    // pero nunca regresar al navegador stacks o secretos.
    res.status(status).json({ error: mensaje });
  };
  app.use(errores);
  return app; // NUNCA escuchar aqui: facilita Supertest.
}
