import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type MemberDocument = Member & Document

@Schema({ timestamps: true })
export class Member {
  @Prop({ required: true, unique: true })
  phone: string

  @Prop({ required: true })
  password: string

  @Prop({ default: '用户' })
  nickname: string

  @Prop({ default: 'bronze', enum: ['bronze', 'silver', 'gold'] })
  level: string

  @Prop({ default: 0 })
  points: number

  @Prop({ default: null })
  avatar: string

  @Prop({ default: 'active', enum: ['active', 'banned'] })
  status: string

  @Prop({ default: 0 })
  totalSpent: number

  @Prop({ default: 0 })
  orderCount: number

  @Prop({ default: 'member', enum: ['member', 'admin'] })
  role: string
}

export const MemberSchema = SchemaFactory.createForClass(Member)
MemberSchema.index({ phone: 1 })
MemberSchema.index({ status: 1 })
