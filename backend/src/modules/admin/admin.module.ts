import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminService } from './admin.service'
import { AdminSeedService } from './admin-seed.service'
import { AdminAuthController } from './admin-auth.controller'
import { AdminDashboardController } from './admin-dashboard.controller'
import { MessagesController } from './messages.controller'
import { AdminContentController } from './admin-content.controller'
import { JwtStrategy } from '../auth/jwt.strategy'
import { Member, MemberSchema } from '../auth/member.schema'
import { Order, OrderSchema } from '../orders/orders.schema'
import { Message, MessageSchema } from './message.schema'
import { Article, ArticleSchema } from '../articles/articles.schema'
import { Store, StoreSchema } from '../stores/stores.schema'
import { Promo, PromoSchema } from '../promo/promo.schema'

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    MongooseModule.forFeature([
      { name: Member.name, schema: MemberSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Article.name, schema: ArticleSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Promo.name, schema: PromoSchema },
    ]),
  ],
  controllers: [AdminAuthController, AdminDashboardController, MessagesController, AdminContentController],
  providers: [AdminService, AdminSeedService, JwtStrategy],
})
export class AdminModule {}
