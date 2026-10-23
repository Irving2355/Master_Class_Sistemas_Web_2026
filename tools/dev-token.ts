import { JoseTokenProvider } from '../src/auth/token-provider.js';

// Este comando es exclusivo de la demostracion local.
// Nunca entregar tokens con privilegios desde un endpoint publico.
if (process.env.NODE_ENV === 'production') {
  throw new Error('No habilitar tokens de demostracion en produccion');
}
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('Define JWT_SECRET');
const rol = process.argv[2] === 'alumno' ? 'alumno' : 'profesor';
const token = await new JoseTokenProvider(secret).firmar({ id: 'demo-1', rol });
console.log(token);
