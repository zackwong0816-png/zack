import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import { AdminService } from './admin.service'

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AdminAuthController {
  constructor(private adminService: AdminService) {}

  @Post('admin/login')
  adminLogin(@Body('username') username: string, @Body('password') password: string) {
    return this.adminService.adminLogin(username, password)
  }
}
