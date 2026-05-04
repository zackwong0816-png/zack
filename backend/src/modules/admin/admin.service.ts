import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { Member, MemberDocument } from '../auth/member.schema'
import { Order, OrderDocument } from '../orders/orders.schema'
import { Message, MessageDocument } from './message.schema'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private jwtService: JwtService,
  ) {}

  async adminLogin(username: string, password: string) {
    const ADMIN_USER = process.env.ADMIN_USER
    const ADMIN_PASS = process.env.ADMIN_PASS

    if (!ADMIN_USER || !ADMIN_PASS) {
      throw new Error('管理员未配置，请设置 ADMIN_USER 和 ADMIN_PASS 环境变量')
    }

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      throw new Error('账号或密码错误')
    }

    const payload = { sub: 'admin', role: 'admin' }
    return {
      accessToken: this.jwtService.sign(payload, { algorithm: 'HS256', expiresIn: '1h' }),
      refreshToken: this.jwtService.sign(payload, { algorithm: 'HS256', expiresIn: '7d' }),
    }
  }

  async dashboard() {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const [todayOrders, todaySales, totalMembers, pendingOrders, recentOrders] = await Promise.all([
      this.orderModel.countDocuments({ createdAt: { $gte: today } }),
      this.orderModel.aggregate([{ $match: { createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      this.memberModel.countDocuments(),
      this.orderModel.countDocuments({ status: { $in: ['pending', 'paid', 'shipped'] } }),
      this.orderModel.find().sort({ createdAt: -1 }).limit(10),
    ])
    return {
      stats: {
        todayOrders,
        todaySales: todaySales[0]?.total || 0,
        totalMembers,
        pendingOrders,
      },
      recentOrders,
    }
  }

  async getMembers(query: any) {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const [items, total] = await Promise.all([
      this.memberModel.find().select('-password').skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
      this.memberModel.countDocuments(),
    ])
    return { items, total, page, pages: Math.ceil(total / limit) }
  }

  async updateMember(id: string, data: any) {
    const { password, ...safeData } = data
    if (password) {
      safeData.password = await bcrypt.hash(password, 12)
    }
    return this.memberModel.findByIdAndUpdate(id, safeData, { new: true }).select('-password')
  }

  async getMessages(query: any) {
    return this.messageModel.find().sort({ createdAt: -1 }).limit(100)
  }

  async replyMessage(id: string, reply: string) {
    return this.messageModel.findByIdAndUpdate(id, { reply, status: 'replied' }, { new: true })
  }

  async updateSettings(data: any) {
    return { message: '请通过环境变量修改管理员配置' }
  }

  async createMessage(data: any) {
    return this.messageModel.create(data)
  }
}
