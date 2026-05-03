import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common'
import { CouponsService } from './coupons.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get()
  findAll() { return this.couponsService.findAll() }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) { return this.couponsService.create(data) }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  claim(@Param('id') id: string) { return this.couponsService.claim(id) }
}
