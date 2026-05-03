import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any, @Query('memberId') memberId: string, @Query('phone') phone: string, @Query('nickname') nickname: string) {
    return this.ordersService.create(memberId, phone, nickname, body.items, body.totalAmount, body.paymentMethod)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('memberId') memberId: string, @Query() query: any) {
    return this.ordersService.findAll(memberId, query)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) { return this.ordersService.findOne(id) }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string) { return this.ordersService.cancel(id) }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status)
  }
}
