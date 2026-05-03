import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { Member, MemberDocument } from '../auth/member.schema'

@Injectable()
export class AdminSeedService implements OnModuleInit {
  constructor(@InjectModel(Member.name) private memberModel: Model<MemberDocument>) {}

  async onModuleInit() {
    const adminUser = process.env.ADMIN_USER || 'admin'
    const adminPass = process.env.ADMIN_PASS || 'admin123'
    const existing = await this.memberModel.findOne({ role: 'admin' })
    if (!existing) {
      const hashed = await bcrypt.hash(adminPass, 10)
      await this.memberModel.create({ name: '管理员', phone: adminUser, password: hashed, role: 'admin', memberId: `admin_${Date.now()}` })
      console.log(`[AdminSeed] Created admin user: ${adminUser}`)
    }
  }
}
