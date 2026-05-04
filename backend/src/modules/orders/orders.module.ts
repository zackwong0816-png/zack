import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { Order, OrderSchema } from './orders.schema'
import { Product, ProductSchema } from '../products/products.schema'
import { Member, MemberSchema } from '../auth/member.schema'

@Module({
  imports: [MongooseModule.forFeature([
    { name: Order.name, schema: OrderSchema },
    { name: Product.name, schema: ProductSchema },
    { name: Member.name, schema: MemberSchema },
  ])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
