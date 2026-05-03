import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type ArticleDocument = Article & Document

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true }) title: string
  @Prop() summary: string
  @Prop() content: string
  @Prop({ default: 'published', enum: ['draft', 'published'] }) status: string
  @Prop() coverImage: string
  @Prop({ default: 0 }) views: number
}

export const ArticleSchema = SchemaFactory.createForClass(Article)
