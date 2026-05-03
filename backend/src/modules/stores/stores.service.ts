import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Store, StoreDocument } from './stores.schema'

@Injectable()
export class StoresService {
  constructor(@InjectModel(Store.name) private storeModel: Model<StoreDocument>) {}

  async findAll() { return this.storeModel.find().sort({ createdAt: 1 }) }

  async create(data: Partial<Store>) { return this.storeModel.create(data) }

  async update(id: string, data: Partial<Store>) { return this.storeModel.findByIdAndUpdate(id, data, { new: true }) }

  async delete(id: string) { return this.storeModel.findByIdAndDelete(id) }
}
