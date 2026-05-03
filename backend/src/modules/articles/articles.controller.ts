import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ArticlesService } from './articles.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  findAll() { return this.articlesService.findAll() }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.articlesService.findOne(id) }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: any) { return this.articlesService.create(data) }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: any) { return this.articlesService.update(id, data) }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string) { return this.articlesService.delete(id) }
}
