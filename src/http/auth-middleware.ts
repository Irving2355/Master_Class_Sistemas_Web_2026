import type { RequestHandler } from 'express';
import type { Identidad, Rol, TokenProvider } from '../auth/token-provider.js';

// Agregamos un atributo tipado a Request: la identidad verificada.
declare global {
  namespace Express {
    interface Request { usuario?: Identidad }
  }
}

export function autenticar(tokens: TokenProvider): RequestHandler {
  return async (req, res, next) => {
    const encabezado = req.header('authorization');
    const partes = encabezado?.split(' ');
    if (!partes || partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1]) {
      res.status(401).json({ error: 'Falta Bearer token' });
      return;
    }
    try {
      req.usuario = await tokens.verificar(partes[1]);
      next(); // Solo pasa al siguiente middleware si verifico.
    } catch {
      res.status(401).json({ error: 'Token invalido o expirado' });
    }
  };
}

export function exigirRol(rol: Rol): RequestHandler {
  return (req, res, next) => {
    if (!req.usuario) {
      res.status(401).json({ error: 'Sin identidad' });
      return;
    }
    if (req.usuario.rol !== rol) {
      res.status(403).json({ error: 'Permisos insuficientes' });
      return;
    }
    next();
  };
}
