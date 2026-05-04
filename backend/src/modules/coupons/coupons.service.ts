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
