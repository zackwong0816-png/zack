import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { Member, MemberDocument } from './member.schema'
import { LoginDto, RegisterDto } from './auth.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.memberModel.findOne({ phone: dto.phone })
    if (existing) throw new UnauthorizedException('该手机号已注册')

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
    if (!member) throw new UnauthorizedException('手机号或密码错误')

    if (member.status === 'banned') throw new UnauthorizedException('账号已被禁用')

    const valid = await bcrypt.compare(dto.password, member.password)
    if (!valid) throw new UnauthorizedException('手机号或密码错误')

    return this.generateToken(member)
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      })
      const member = await this.memberModel.findById(payload.sub)
      if (!member || member.status === 'banned') {
        this.logger.warn(`Refresh token failed: member not found or banned [sub=${payload.sub}]`)
        return null
      }
      return this.generateToken(member)
    } catch (err) {
      this.logger.warn(`Refresh token failed: ${err.message}`)
      return null
    }
  }

  async getProfile(memberId: string) {
    const member = await this.memberModel.findById(memberId).select('-password')
    if (!member) throw new UnauthorizedException('会员不存在')
    return member
  }

  async updateMember(memberId: string, data: Partial<Member>) {
    const { password, phone, role, status, ...safeData } = data
    return this.memberModel.findByIdAndUpdate(memberId, safeData, { new: true }).select('-password')
  }

  async changePassword(memberId: string, oldPassword: string, newPassword: string) {
    const member = await this.memberModel.findById(memberId)
    if (!member) throw new UnauthorizedException('会员不存在')

    const valid = await bcrypt.compare(oldPassword, member.password)
    if (!valid) throw new UnauthorizedException('原密码错误')

    member.password = await bcrypt.hash(newPassword, 12)
    await member.save()
    return { message: '密码修改成功' }
  }

  private generateToken(member: MemberDocument) {
    const payload = { sub: member._id, phone: member.phone, role: 'member' }
    const accessToken = this.jwtService.sign(payload, { algorithm: 'HS256', expiresIn: '1h' })
    const refreshToken = this.jwtService.sign(payload, { algorithm: 'HS256', expiresIn: '7d' })
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
