import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import swaggerDocument from '../swagger.json' assert { type: 'json' };
import {
  generalLimiter,
  authLimiter,
  apiLimiter,
  ingestionLimiter,
} from './middlewares/rateLimiter.js';
import { requestLogger, errorLogger } from './middlewares/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

async function createApp() {
  const app = express();

  // Trust proxy for rate limiting and IP detection
  app.set('trust proxy', 1);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  app.use('/api/auth', authLimiter);
  app.use('/api/jobs/ingest', ingestionLimiter);
  app.use('/api', apiLimiter);
  app.use(generalLimiter);

  // API routes - imported dynamically after Firebase initialization
  const routes = await import('./routes/index.js');
  app.use('/api', routes.default);

  // API Documentation
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Rozgarly API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Rozgarly API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: env.NODE_ENV,
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Rozgarly API',
      documentation: '/api/docs',
      health: '/health',
      version: '1.0.0',
    });
  });

  // Error handling middleware
  app.use(errorLogger);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
