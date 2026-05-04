import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Member, MemberDocument } from '../auth/member.schema'
import { Order, OrderDocument } from '../orders/orders.schema'

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(query: any) {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const [items, total] = await Promise.all([
      this.memberModel.find().select('-password').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      this.memberModel.countDocuments(),
    ])
    return { items, total, page, pages: Math.ceil(total / limit) }
  }

  async updateMember(id: string, data: Partial<Member>) {
    return this.memberModel.findByIdAndUpdate(id, data, { new: true }).select('-password')
  }

  async getMemberOrders(memberId: string) {
    return this.orderModel.find({ memberId }).sort({ createdAt: -1 })
  }

  async getMemberPoints(memberId: string) {
    const member = await this.memberModel.findById(memberId)
    if (!member) return { points: 0, records: [] }
    return { points: member.points, records: [] }
  }

  async onOrderCompleted(memberId: string, totalAmount: number) {
    const member = await this.memberModel.findById(memberId)
    if (!member) return

    const pointsEarned = Math.floor(totalAmount / 10)
    const newTotalSpent = member.totalSpent + totalAmount
    const newOrderCount = member.orderCount + 1
    const newPoints = member.points + pointsEarned

    let newLevel = member.level || 'bronze'
    if (newTotalSpent >= 10000) newLevel = 'gold'
    else if (newTotalSpent >= 5000) newLevel = 'silver'

    await this.memberModel.findByIdAndUpdate(memberId, {
      totalSpent: newTotalSpent,
      orderCount: newOrderCount,
      points: newPoints,
      level: newLevel,
    })
  }
}
