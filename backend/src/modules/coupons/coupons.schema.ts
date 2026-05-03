import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type CouponDocument = Coupon & Document

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true }) name: string
  @Prop({ default: '满减', enum: ['满减', '折扣'] }) type: string
  @Prop({ required: true }) value: number
  @Prop() condition: number
  @Prop({ default: 0 }) discount: number
  @Prop({ default: 0 }) claimedCount: number
  @Prop({ default: 0 }) usedCount: number
  @Prop({ default: 'active', enum: ['active', 'inactive'] }) status: string
  @Prop() startDate: Date
  @Prop() endDate: Date
}

export const CouponSchema = SchemaFactory.createForClass(Coupon)
