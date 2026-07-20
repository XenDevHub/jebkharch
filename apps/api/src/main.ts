import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose'],
  });

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.ADMIN_PANEL_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8081', // Expo Metro
      // Production origins
      'https://admin.jebkharch.pk',
      'https://api.jebkharch.pk',
      'http://109.199.122.238:3000',
    ],
    credentials: true,
  });

  // ── Validation ────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Jeb Kharch API')
    .setDescription(
      'Play Smart. Win Real. — REST API for the Jeb Kharch quiz gaming platform.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Phone OTP authentication')
    .addTag('quiz', 'Quiz engine endpoints')
    .addTag('wallet', 'Coin wallet & withdrawals')
    .addTag('challenge', 'PvP challenge mode')
    .addTag('referral', 'Referral system')
    .addTag('user', 'User profile management')
    .addTag('admin', 'Admin panel endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = process.env.API_PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 API running at http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
