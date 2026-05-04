import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Coupon, CouponDocument } from './coupons.schema'

@Injectable()
export class CouponsService {
  constructor(@InjectModel(Coupon.name) private couponModel: Model<CouponDocument>) {}

  async findAll() { return this.couponModel.find().sort({ createdAt: -1 }) }

  async create(data: Partial<Coupon>) { return this.couponModel.create(data) }

  async claim(id: string, memberId: string) {
    const coupon = await this.couponModel.findById(id)
    if (!coupon) throw new BadRequestException('优惠券不存在')
    if (coupon.status === 'inactive') throw new BadRequestException('优惠券已失效')
    if ((coupon.claimedBy as string[]).includes(memberId)) throw new BadRequestException('已领取过该优惠券')

    await this.couponModel.findByIdAndUpdate(id, {
      $push: { claimedBy: memberId },
      $inc: { claimedCount: 1 },
    })
    return { message: '领取成功' }
  }
}
