import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all frontend requests (Vercel, preview deployments, localhost, mobile LAN)
  app.enableCors({
    origin: true, // Dynamically reflects requesting origin, supporting Vercel previews & production
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'Expires',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'Accept-Ranges', 'Content-Length'],
    credentials: true,
  });

  // Smart HTTP Caching headers:
  // - Public GET requests: allow browser to cache for 15s and serve stale up to 10 mins while revalidating in background
  // - Mutating requests (POST, PUT, DELETE, PATCH) or private Auth routes: strictly no-store
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isPublicGet = req.method === 'GET' && !req.path.includes('/auth/me');
    if (isPublicGet) {
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=600');
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  // Serve uploaded files statically with proper MIME types for audio streaming
  app.use(
    '/uploads',
    express.static(join(process.cwd(), 'public', 'uploads'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.webm')) {
          res.setHeader('Content-Type', 'audio/webm');
        } else if (filePath.endsWith('.mp3')) {
          res.setHeader('Content-Type', 'audio/mpeg');
        } else if (filePath.endsWith('.ogg')) {
          res.setHeader('Content-Type', 'audio/ogg');
        } else if (filePath.endsWith('.wav')) {
          res.setHeader('Content-Type', 'audio/wav');
        }
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day static asset cache
      },
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Dharohar Setu NestJS Backend is running on: http://localhost:${port}`);

  // Background Cache Pre-Warm (Non-blocking): Ensures first visitors get 0ms responses
  setTimeout(async () => {
    try {
      const { AnalyticsService } = await import('./modules/analytics/analytics.service');
      const { RecordsService } = await import('./modules/records/records.service');
      const { RegionsLanguagesService } = await import('./modules/regions-languages/regions-languages.service');
      
      const analytics = app.get(AnalyticsService);
      const records = app.get(RecordsService);
      const regions = app.get(RegionsLanguagesService);

      await Promise.allSettled([
        analytics.getLiveCounters(),
        regions.getRegionsHierarchy(),
        regions.getFadingFastestLanguages(),
        records.getRecords({ limit: 6, sort: 'urgency' }),
      ]);
      console.log('✓ Dharohar Setu Cache Pre-Warmed successfully (0ms latency ready)');
    } catch (err) {
      console.warn('Note: Cache pre-warm non-critical warning:', err);
    }
  }, 1000);
}

bootstrap();
