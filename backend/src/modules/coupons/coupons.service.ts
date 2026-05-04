import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Coupon, CouponDocument } from './coupons.schema'

@Injectable()
export class CouponsService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<CouponDocument>) {}

  async findAll() { return this.couponModel.find().sort({ createdAt: -1 }) }

  async create(data: Partial<Coupon>) { return this.couponModel.create(data) }

  async claim(id: string, memberId: string) {
    const coupon = await this.couponModel.findById(id)
    if (!coupon) throw new BadRequestException('优惠券不存在')
    if (coupon.status !== 'active') throw new BadRequestException('优惠券已失效')

    const now = new Date()
    if (coupon.startDate && now < coupon.startDate) throw new BadRequestException('优惠券还未开始')
    if (coupon.endDate && now > coupon.endDate) throw new BadRequestException('优惠券已过期')
    if ((coupon.claimedBy as string[]).includes(memberId)) throw new BadRequestException('已领取过该优惠券')

    const result = await this.couponModel.findByIdAndUpdate(
      {
        _id: new Types.ObjectId(id),
        status: 'active',
        claimedBy: { $ne: memberId },
      },
      {
        $addToSet: { claimedBy: memberId },
        $inc: { claimedCount: 1 },
      },
      { new: true }
    )
    if (!result) throw new BadRequestException('优惠券不存在、已失效或已领取')
    return { message: '领取成功' }
  }
}
