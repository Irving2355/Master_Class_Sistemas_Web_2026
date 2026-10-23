import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { crearApp } from '../../src/http/create-app.js';
import { JoseTokenProvider } from '../../src/auth/token-provider.js';
import { MemoryTicketRepository } from '../../src/repositories/ticket-repository.js';
import { TicketService } from '../../src/services/ticket-service.js';

const secret = 'secreto-solo-para-pruebas-1234567890-otro';
const tokens = new JoseTokenProvider(secret);

function nuevaApp(limite = 100) {
  // Cada prueba recibe almacenamiento nuevo: no hay fuga de estado.
  const service = new TicketService(new MemoryTicketRepository());
  return crearApp({ service, tokens, limite });
}

describe('HTTP: rutas + middlewares + servicio + repositorio', () => {
  it('GET /api/salud responde 200', async () => {
    const respuesta = await request(nuevaApp()).get('/api/salud');
    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual({ ok: true });
  });

  it('POST sin token retorna 401', async () => {
    const r = await request(nuevaApp()).post('/api/tickets')
      .send({ titulo: 'No autorizado' });
    expect(r.status).toBe(401);
  });

  it('POST alumno autenticado retorna 403', async () => {
    const alumno = await tokens.firmar({ id: 'a1', rol: 'alumno' });
    const r = await request(nuevaApp()).post('/api/tickets')
      .set('Authorization', `Bearer ${alumno}`)
      .send({ titulo: 'Sin permiso' });
    expect(r.status).toBe(403);
  });

  it('profesor crea, consulta y valida un recurso', async () => {
    const app = nuevaApp();
    const profesor = await tokens.firmar({ id: 'p1', rol: 'profesor' });
    const creada = await request(app).post('/api/tickets')
      .set('Authorization', `Bearer ${profesor}`)
      .send({ titulo: '  Problema al ingresar  ' });
    expect(creada.status).toBe(201);
    expect(creada.body.data.titulo).toBe('Problema al ingresar');
    const consulta = await request(app).get('/api/tickets/1');
    expect(consulta.status).toBe(200);
    expect(consulta.body.data.propietarioId).toBe('p1');
  });

  it('GET de recurso inexistente retorna 404', async () => {
    const r = await request(nuevaApp()).get('/api/tickets/999');
    expect(r.status).toBe(404);
  });

  it('POST con titulo invalido retorna 400, no 500', async () => {
    const profesor = await tokens.firmar({ id: 'p1', rol: 'profesor' });
    const r = await request(nuevaApp()).post('/api/tickets')
      .set('Authorization', `Bearer ${profesor}`).send({ titulo: 'a' });
    expect(r.status).toBe(400);
  });

  it('Bearer alterado devuelve 401', async () => {
    const r = await request(nuevaApp()).post('/api/tickets')
      .set('Authorization', 'Bearer texto.que.no.es.jwt')
      .send({ titulo: 'Titulo valido' });
    expect(r.status).toBe(401);
  });

  it('limita solicitudes cuando se supera el umbral', async () => {
    const app = nuevaApp(2);
    expect((await request(app).get('/api/salud')).status).toBe(200);
    expect((await request(app).get('/api/salud')).status).toBe(200);
    expect((await request(app).get('/api/salud')).status).toBe(429);
  });
});
