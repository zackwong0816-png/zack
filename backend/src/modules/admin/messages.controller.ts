import { Controller, Post, Body } from '@nestjs/common'
import { AdminService } from './admin.service'

@Controller('messages')
export class MessagesController {
  constructor(private adminService: AdminService) {}

  @Post()
  create(@Body() data: any) { return this.adminService.createMessage(data) }
}
