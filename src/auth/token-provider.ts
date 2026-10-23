import { jwtVerify, SignJWT } from 'jose';

export type Rol = 'alumno' | 'profesor';
export interface Identidad { id: string; rol: Rol }

// Otro contrato: la API desconoce que biblioteca JWT utilizamos.
export interface TokenProvider {
  firmar(usuario: Identidad): Promise<string>;
  verificar(token: string): Promise<Identidad>;
}

export class JoseTokenProvider implements TokenProvider {
  private readonly llave: Uint8Array;

  constructor(secreto: string) {
    // HMAC HS256 requiere una clave secreta robusta y privada.
    if (secreto.length < 32) throw new Error('JWT_SECRET demasiado corto');
    this.llave = new TextEncoder().encode(secreto);
  }

  async firmar(usuario: Identidad): Promise<string> {
    return new SignJWT({ rol: usuario.rol })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(usuario.id)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(this.llave);
  }

  async verificar(token: string): Promise<Identidad> {
    // Verificar valida firma, formato y expiracion; decodificar NO basta.
    const { payload } = await jwtVerify(token, this.llave, {
      algorithms: ['HS256'],
    });
    if (typeof payload.sub !== 'string' ||
        (payload.rol !== 'alumno' && payload.rol !== 'profesor')) {
      throw new Error('Token sin claims validos');
    }
    return { id: payload.sub, rol: payload.rol };
  }
}
