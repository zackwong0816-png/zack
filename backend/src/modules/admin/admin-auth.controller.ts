import { Controller, Post, Body } from '@nestjs/common'
import { AdminService } from './admin.service'

@Controller('auth')
export class AdminAuthController {
  constructor(private adminService: AdminService) {}

  @Post('admin/login')
  adminLogin(@Body('username') username: string, @Body('password') password: string) {
    return this.adminService.adminLogin(username, password)
  }
}
