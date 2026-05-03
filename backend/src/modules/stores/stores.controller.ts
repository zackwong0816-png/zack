import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { StoresService } from './stores.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get()
  findAll() { return this.storesService.findAll() }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) { return this.storesService.create(data) }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: any) { return this.storesService.update(id, data) }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string) { return this.storesService.delete(id) }
}
