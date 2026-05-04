import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { CartService } from './cart.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser('sub') memberId: string) {
    return this.cartService.getCart(memberId)
  }

  @Post('items')
  addItem(
    @CurrentUser('sub') memberId: string,
    @Body() body: { productId: string; quantity: number },
  ) {
    return this.cartService.addItem(memberId, body.productId, body.quantity)
  }

  @Put('items/:productId')
  updateItem(
    @CurrentUser('sub') memberId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(memberId, productId, quantity)
  }

  @Delete('items/:productId')
  removeItem(
    @CurrentUser('sub') memberId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(memberId, productId)
  }

  @Delete()
  clear(@CurrentUser('sub') memberId: string) {
    return this.cartService.clear(memberId)
  }
}
