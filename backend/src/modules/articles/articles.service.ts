import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Article, ArticleDocument } from './articles.schema'

@Injectable()
export class ArticlesService {
  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) {}

  async findAll() { return this.articleModel.find().sort({ createdAt: -1 }) }

  async findOne(id: string) { return this.articleModel.findById(id) }

  async create(data: Partial<Article>) { return this.articleModel.create(data) }

  async update(id: string, data: Partial<Article>) { return this.articleModel.findByIdAndUpdate(id, data, { new: true }) }

  async delete(id: string) { return this.articleModel.findByIdAndDelete(id) }
}
