import { Controller, Get } from '@nestjs/common'

@Controller('api')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}