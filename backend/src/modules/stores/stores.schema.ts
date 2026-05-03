import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type StoreDocument = Store & Document

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true }) name: string
  @Prop({ required: true }) address: string
  @Prop() phone: string
  @Prop() hours: string
  @Prop({ default: '北京市' }) city: string
  @Prop() lat: number
  @Prop() lng: number
  @Prop({ default: true }) active: boolean
}

export const StoreSchema = SchemaFactory.createForClass(Store)
