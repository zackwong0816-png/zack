import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type OrderDocument = Order & Document

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ required: true }) productId: string
  @Prop({ required: true }) name: string
  @Prop({ required: true }) price: number
  @Prop({ required: true, default: 1 }) qty: number
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem)

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true }) orderNo: string
  @Prop({ type: Types.ObjectId, ref: 'Member', index: true }) memberId: Types.ObjectId
  @Prop() memberPhone: string
  @Prop() memberNickname: string
  @Prop({ type: [OrderItemSchema], default: [] }) items: OrderItem[]
  @Prop({ required: true }) totalAmount: number
  @Prop({ default: 'pending', enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'], index: true }) status: string
  @Prop() address: string
  @Prop() paymentMethod: string
  @Prop({ default: 'unpaid' }) paymentStatus: string
}

export const OrderSchema = SchemaFactory.createForClass(Order)
OrderSchema.index({ memberId: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
