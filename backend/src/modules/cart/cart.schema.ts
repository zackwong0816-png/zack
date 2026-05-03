import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type CartDocument = Cart & Document

@Schema()
export class CartItem {
  @Prop({ required: true }) productId: string
  @Prop({ required: true }) name: string
  @Prop({ required: true }) price: number
  @Prop({ required: true, default: 1 }) quantity: number
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem)

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true }) memberId: Types.ObjectId
  @Prop({ type: [CartItemSchema], default: [] }) items: CartItem[]
}

export const CartSchema = SchemaFactory.createForClass(Cart)
