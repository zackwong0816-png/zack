import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('sub') memberId: string,
    @Body() body: any,
  ) {
    return this.ordersService.create(memberId, body.address, body.items, body.paymentMethod)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser('sub') memberId: string) {
    return this.ordersService.findAll(memberId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser('sub') memberId: string) {
    return this.ordersService.findOne(id, memberId)
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @CurrentUser('sub') memberId: string) {
    return this.ordersService.cancel(id, memberId)
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status)
  }
}
