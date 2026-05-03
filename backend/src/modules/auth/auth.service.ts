import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { Member, MemberDocument } from './member.schema'
import { LoginDto, RegisterDto } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.memberModel.findOne({ phone: dto.phone })
    if (existing) throw new Error('该手机号已注册')

    const hashedPassword = await bcrypt.hash(dto.password, 12)
    const member = await this.memberModel.create({
      phone: dto.phone,
      password: hashedPassword,
      nickname: dto.nickname || `用户${dto.phone.slice(-4)}`,
    })

    return this.generateToken(member)
  }

  async login(dto: LoginDto) {
    const member = await this.memberModel.findOne({ phone: dto.phone })
    if (!member) throw new Error('手机号或密码错误')

    const valid = await bcrypt.compare(dto.password, member.password)
    if (!valid) throw new Error('手机号或密码错误')

    return this.generateToken(member)
  }

  async getProfile(memberId: string) {
    const member = await this.memberModel.findById(memberId).select('-password')
    if (!member) throw new Error('会员不存在')
    return member
  }

  async updateMember(memberId: string, data: Partial<Member>) {
    return this.memberModel.findByIdAndUpdate(memberId, data, { new: true }).select('-password')
  }

  async changePassword(memberId: string, oldPassword: string, newPassword: string) {
    const member = await this.memberModel.findById(memberId)
    if (!member) throw new Error('会员不存在')

    const valid = await bcrypt.compare(oldPassword, member.password)
    if (!valid) throw new Error('原密码错误')

    member.password = await bcrypt.hash(newPassword, 12)
    await member.save()
    return { message: '密码修改成功' }
  }

  private generateToken(member: MemberDocument) {
    const payload = { sub: member._id, phone: member.phone, role: 'member' }
    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' })
    return {
      accessToken,
      refreshToken,
      member: {
        id: member._id,
        phone: member.phone,
        nickname: member.nickname,
        level: member.level,
        points: member.points,
        avatar: member.avatar,
      },
    }
  }
}
