import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ProductDocument = Product & Document
export type CategoryDocument = Category & Document

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string

  @Prop({ default: '' })
  desc: string

  @Prop({ required: true })
  price: number

  @Prop()
  originalPrice: number

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId

  @Prop({ default: [] })
  tags: string[]

  @Prop({ default: [] })
  images: string[]

  @Prop({ default: 100 })
  stock: number

  @Prop({ default: 0 })
  sales: number

  @Prop({ default: 4.5 })
  rating: number

  @Prop({ default: 'active', enum: ['active', 'inactive'] })
  status: string
}

export const ProductSchema = SchemaFactory.createForClass(Product)
ProductSchema.index({ category: 1 })
ProductSchema.index({ status: 1 })
ProductSchema.index({ name: 'text', desc: 'text' })

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  slug: string

  @Prop()
  icon: string

  @Prop({ default: 0 })
  sort: number
}

export const CategorySchema = SchemaFactory.createForClass(Category)
