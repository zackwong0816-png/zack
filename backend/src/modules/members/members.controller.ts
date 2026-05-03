import { Controller, Get, Put, Param, Query, Body, UseGuards, Req } from '@nestjs/common'
import { MembersService } from './members.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return this.membersService['memberModel'].findById(req.user.sub).select('-password')
  }

  @Get('me/orders')
  @UseGuards(JwtAuthGuard)
  getOrders(@Req() req: any) {
    return this.membersService.getMemberOrders(req.user.sub)
  }

  @Get('me/points')
  @UseGuards(JwtAuthGuard)
  getPoints(@Req() req: any) {
    return this.membersService.getMemberPoints(req.user.sub)
  }
}
