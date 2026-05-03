import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Article, ArticleDocument } from '../articles/articles.schema'
import { Store, StoreDocument } from '../stores/stores.schema'
import { Promo, PromoDocument } from '../promo/promo.schema'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminContentController {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Promo.name) private promoModel: Model<PromoDocument>,
  ) {}

  // Articles
  @Get('articles') findAllArticles() { return this.articleModel.find().sort({ createdAt: -1 }) }
  @Post('articles') createArticle(@Body() data: any) { return this.articleModel.create(data) }
  @Put('articles/:id') updateArticle(@Param('id') id: string, @Body() data: any) { return this.articleModel.findByIdAndUpdate(id, data, { new: true }) }
  @Delete('articles/:id') deleteArticle(@Param('id') id: string) { return this.articleModel.findByIdAndDelete(id) }

  // Stores
  @Get('stores') findAllStores() { return this.storeModel.find().sort({ createdAt: 1 }) }
  @Post('stores') createStore(@Body() data: any) { return this.storeModel.create(data) }
  @Put('stores/:id') updateStore(@Param('id') id: string, @Body() data: any) { return this.storeModel.findByIdAndUpdate(id, data, { new: true }) }
  @Delete('stores/:id') deleteStore(@Param('id') id: string) { return this.storeModel.findByIdAndDelete(id) }

  // Promos
  @Get('promos') findAllPromos() { return this.promoModel.find().sort({ createdAt: -1 }) }
  @Post('promos') createPromo(@Body() data: any) { return this.promoModel.create(data) }
  @Put('promos/:id') updatePromo(@Param('id') id: string, @Body() data: any) { return this.promoModel.findByIdAndUpdate(id, data, { new: true }) }
  @Delete('promos/:id') deletePromo(@Param('id') id: string) { return this.promoModel.findByIdAndDelete(id) }
}
