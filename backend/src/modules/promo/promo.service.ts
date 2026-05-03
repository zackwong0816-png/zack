import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Promo, PromoDocument } from './promo.schema'

@Injectable()
export class PromoService {
  constructor(@InjectModel(Promo.name) private promoModel: Model<PromoDocument>) {}

  async findAll() { return this.promoModel.find().sort({ createdAt: -1 }) }

  async create(data: Partial<Promo>) { return this.promoModel.create(data) }

  async update(id: string, data: Partial<Promo>) { return this.promoModel.findByIdAndUpdate(id, data, { new: true }) }

  async delete(id: string) { return this.promoModel.findByIdAndDelete(id) }
}
