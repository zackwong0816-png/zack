import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type MessageDocument = Message & Document

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true }) name: string
  @Prop({ required: true }) phone: string
  @Prop() email: string
  @Prop() type: string
  @Prop({ required: true }) content: string
  @Prop({ default: 'new', enum: ['new', 'replied'] }) status: string
  @Prop() reply: string
  @Prop() date: string
}

export const MessageSchema = SchemaFactory.createForClass(Message)
