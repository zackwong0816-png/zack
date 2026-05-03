import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PromoDocument = Promo & Document

@Schema({ timestamps: true })
export class Promo {
  @Prop({ required: true }) name: string
  @Prop() desc: string
  @Prop({ enum: ['discount', 'coupon', 'flash'], default: 'discount' }) type: string
  @Prop() startDate: Date
  @Prop() endDate: Date
  @Prop({ default: 'upcoming', enum: ['upcoming', 'active', 'ended'] }) status: string
  @Prop({ default: 0 }) views: number
  @Prop({ default: 0 }) orders: number
  @Prop({ default: 0 }) sales: number
}

export const PromoSchema = SchemaFactory.createForClass(Promo)
