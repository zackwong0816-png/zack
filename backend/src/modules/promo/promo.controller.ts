import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { PromoService } from './promo.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('promos')
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Get() findAll() { return this.promoService.findAll() }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) { return this.promoService.create(data) }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: any) { return this.promoService.update(id, data) }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string) { return this.promoService.delete(id) }
}
