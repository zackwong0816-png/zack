import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  try {
    console.log('[Bootstrap] Creating NestJS app...')
    const app = await NestFactory.create(AppModule)
    console.log('[Bootstrap] App created')

    app.setGlobalPrefix('api')
    console.log('[Bootstrap] Global prefix set to api')

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }))
    console.log('[Bootstrap] Global pipes set')

    app.enableCors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    })
    console.log('[Bootstrap] CORS enabled')

    console.log('[Bootstrap] Starting to listen on port 3000...')
    await app.listen(3000, '0.0.0.0')
    console.log('[Bootstrap] 🚀 Nova Backend running on http://localhost:3000')
  } catch (e) {
    console.error('[Bootstrap] Failed to start:', e)
    process.exit(1)
  }
}
bootstrap()
