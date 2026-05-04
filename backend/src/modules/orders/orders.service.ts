import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Order, OrderDocument } from './orders.schema'
import { Product, ProductDocument } from '../products/products.schema'
import { Member, MemberDocument } from '../auth/member.schema'

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
  ) {}

  async create(memberId: string, address: string, items: any[], paymentMethod: string) {
    if (!items || items.length === 0) throw new BadRequestException('订单商品不能为空')
    if (!address) throw new BadRequestException('收货地址不能为空')

    const productIds = items.map((i: any) => new Types.ObjectId(i.productId))
    const products = await this.productModel.find({ _id: { $in: productIds } }).lean()
    const productMap = new Map(products.map(p => [p._id.toString(), p]))

    let totalAmount = 0
    const orderItems = []
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) throw new BadRequestException(`商品 ${item.productId} 不存在`)
      if (product.stock < item.quantity) {
        throw new BadRequestException(`商品 ${product.name} 库存不足，剩余 ${product.stock}`)
      }
      const price = product.price
      totalAmount += price * item.quantity
      orderItems.push({ productId: item.productId, name: product.name, price, qty: item.quantity })
    }

    const orderNo = 'NOVA' + Date.now().toString(36) + '-' + crypto.randomUUID().slice(0, 8).toUpperCase()

    const order = await this.orderModel.create({
      orderNo,
      memberId: new Types.ObjectId(memberId),
      items: orderItems,
      totalAmount,
      address,
      paymentMethod,
      status: 'pending',
    })

    for (const item of items) {
      await this.productModel.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity, sales: item.quantity } })
    }

    return order
  }

  async findAll(memberId: string) {
    return this.orderModel.find({ memberId: new Types.ObjectId(memberId) }).sort({ createdAt: -1 }).limit(100)
  }

  async findOne(id: string, memberId: string) {
    const order = await this.orderModel.findOne({ _id: new Types.ObjectId(id), memberId: new Types.ObjectId(memberId) })
    if (!order) throw new BadRequestException('订单不存在')
    return order
  }

  async updateStatus(id: string, status: string) {
    const allowed = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
    if (!allowed.includes(status)) throw new BadRequestException('无效的订单状态')
    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true })

    if (['paid', 'shipped', 'completed'].includes(status)) {
      await this.updateMemberStats(order.memberId.toString(), order.totalAmount)
    }

    return order
  }

  private async updateMemberStats(memberId: string, totalAmount: number) {
    const member = await this.memberModel.findById(memberId)
    if (!member) return

    const pointsEarned = Math.floor(totalAmount / 10)
    const newTotalSpent = (member.totalSpent || 0) + totalAmount
    const newOrderCount = (member.orderCount || 0) + 1
    const newPoints = (member.points || 0) + pointsEarned

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

  async cancel(id: string, memberId: string) {
    const order = await this.orderModel.findOne({ _id: new Types.ObjectId(id), memberId: new Types.ObjectId(memberId) })
    if (!order) throw new BadRequestException('订单不存在')
    if (!['pending', 'paid'].includes(order.status)) throw new BadRequestException('当前状态无法取消')

    await this.orderModel.findByIdAndUpdate(id, { status: 'cancelled' })
    for (const item of order.items) {
      await this.productModel.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty, sales: -item.qty } })
    }
    return { message: '订单已取消' }
  }

  async countByStatus(memberId?: string) {
    const filter = memberId ? { memberId: new Types.ObjectId(memberId) } : {}
    const pending = await this.orderModel.countDocuments({ ...filter, status: { $in: ['pending', 'paid', 'shipped'] } })
    return { pending }
  }
}
