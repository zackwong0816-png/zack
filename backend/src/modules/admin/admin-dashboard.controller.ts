import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminDashboardController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard') dashboard() { return this.adminService.dashboard() }
  @Get('members') getMembers(@Query() query: any) { return this.adminService.getMembers(query) }
  @Put('members/:id') updateMember(@Param('id') id: string, @Body() data: any) { return this.adminService.updateMember(id, data) }
  @Get('messages') getMessages(@Query() query: any) { return this.adminService.getMessages(query) }
  @Put('messages/:id/reply') replyMessage(@Param('id') id: string, @Body('reply') reply: string) { return this.adminService.replyMessage(id, reply) }
  @Put('settings') updateSettings(@Body() data: any) { return this.adminService.updateSettings(data) }
}
