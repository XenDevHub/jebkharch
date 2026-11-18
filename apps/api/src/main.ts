import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose'],
  });

  // ── Security Headers (Helmet) ─────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false, // Mobile & API clients communicate via JSON
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Disable X-Powered-By
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── CORS ──────────────────────────────────────────────────────────────────
  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins: (string | RegExp)[] = [
    'https://jaibkharch.com',
    'https://www.jaibkharch.com',
    'https://admin.jaibkharch.com',
    'https://api.jaibkharch.com',
    'https://jebkharch.pk',
    'https://www.jebkharch.pk',
    'https://admin.jebkharch.pk',
    'https://api.jebkharch.pk',
  ];

  if (process.env.ADMIN_PANEL_URL) {
    allowedOrigins.push(process.env.ADMIN_PANEL_URL);
  }

  if (!isProd) {
    allowedOrigins.push(
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8081',
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
    );
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') return allowed === origin;
        if (allowed instanceof RegExp) return allowed.test(origin);
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`Blocked by CORS policy: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
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

  // ── Swagger / OpenAPI (Disabled in production unless explicitly enabled) ───
  if (!isProd || process.env.ENABLE_SWAGGER === 'true') {
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
    logger.log(`📚 Swagger docs available at /api/docs`);
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = process.env.API_PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 API running at port ${port} [env: ${process.env.NODE_ENV || 'development'}]`);
}

bootstrap();
