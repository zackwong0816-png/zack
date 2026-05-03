import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Order, OrderDocument } from './orders.schema'

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async create(memberId: string, memberPhone: string, memberNickname: string, items: any[], totalAmount: number, paymentMethod: string) {
    const orderNo = 'NOVA' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase()
    return this.orderModel.create({ orderNo, memberId: new Types.ObjectId(memberId), memberPhone, memberNickname, items, totalAmount, paymentMethod })
  }

  async findAll(memberId: string, query: any) {
    const filter: any = {}
    if (memberId) filter.memberId = new Types.ObjectId(memberId)
    if (query.status) filter.status = query.status
    return this.orderModel.find(filter).sort({ createdAt: -1 }).limit(50)
  }

  async findOne(id: string) { return this.orderModel.findById(id) }

  async updateStatus(id: string, status: string) {
    return this.orderModel.findByIdAndUpdate(id, { status }, { new: true })
  }

  async cancel(id: string) {
    return this.orderModel.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true })
  }

  async countByStatus(memberId?: string) {
    const filter = memberId ? { memberId: new Types.ObjectId(memberId) } : {}
    const pending = await this.orderModel.countDocuments({ ...filter, status: { $in: ['pending', 'paid', 'shipped'] } })
    return { pending }
  }
}
