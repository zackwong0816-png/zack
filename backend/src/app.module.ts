import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './modules/auth/auth.module'
import { MembersModule } from './modules/members/members.module'
import { ProductsModule } from './modules/products/products.module'
import { OrdersModule } from './modules/orders/orders.module'
import { CartModule } from './modules/cart/cart.module'
import { CouponsModule } from './modules/coupons/coupons.module'
import { AdminModule } from './modules/admin/admin.module'
import { StoresModule } from './modules/stores/stores.module'
import { ArticlesModule } from './modules/articles/articles.module'
import { PromoModule } from './modules/promo/promo.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nova'),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    MembersModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    CouponsModule,
    AdminModule,
    StoresModule,
    ArticlesModule,
    PromoModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
