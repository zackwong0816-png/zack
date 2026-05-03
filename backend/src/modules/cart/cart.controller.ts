import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { CartService } from './cart.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Body('memberId') memberId: string) { return this.cartService.getCart(memberId) }

  @Post('items')
  addItem(@Body() body: { memberId: string; productId: string; name: string; price: number; quantity: number }) {
    return this.cartService.addItem(body.memberId, body.productId, body.name, body.price, body.quantity)
  }

  @Put('items/:productId')
  updateItem(@Param('productId') productId: string, @Body() body: { memberId: string; quantity: number }) {
    return this.cartService.updateItem(body.memberId, productId, body.quantity)
  }

  @Delete('items/:productId')
  removeItem(@Param('productId') productId: string, @Body('memberId') memberId: string) {
    return this.cartService.removeItem(memberId, productId)
  }

  @Delete()
  clear(@Body('memberId') memberId: string) { return this.cartService.clear(memberId) }
}
