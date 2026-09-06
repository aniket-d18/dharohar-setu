import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend requests
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Disable HTTP caching on API endpoints so all edits reflect immediately
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
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
      },
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Dharohar Setu NestJS Backend is running on: http://localhost:${port}`);
}

bootstrap();
