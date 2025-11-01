import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Etapa 1.4: Habilita o CORS
  // Permite que o frontend (em localhost:5173) acesse o backend
  app.enableCors({
    origin: '*', // Em produção, mude para o domínio do seu frontend
  });

  // Etapa 1.4: Define um prefixo global para a API
  // Todas as rotas serão ex: /api/v1/kpis
  app.setGlobalPrefix('api/v1');

  // A porta padrão do NestJS é 3000 (a mesma que definimos no frontend)
  await app.listen(3000);
  console.log(`Backend rodando na porta 3000`); // <-- Você deve ver isso no terminal
}
bootstrap();
