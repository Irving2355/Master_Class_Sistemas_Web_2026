import { crearApp } from './http/create-app.js';
import { JoseTokenProvider } from './auth/token-provider.js';
import { MemoryTicketRepository } from './repositories/ticket-repository.js';
import { TicketService } from './services/ticket-service.js';

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('Define JWT_SECRET (consulta .env.example)');
const tokens = new JoseTokenProvider(secret);
const service = new TicketService(new MemoryTicketRepository());
const app = crearApp({ service, tokens });
const puerto = Number(process.env.PORT ?? 3000);
app.listen(puerto, () => console.log(`API en http://localhost:${puerto}`));
