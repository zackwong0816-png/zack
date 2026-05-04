import { IsString, IsOptional, MinLength, Matches } from 'class-validator'

export class LoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string

  @IsString()
  password: string
}

export class RegisterDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string

  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string

  @IsOptional()
  @IsString()
  nickname?: string
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string

  @IsString()
  @MinLength(6, { message: '新密码至少6位' })
  newPassword: string
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string

  @IsOptional()
  @IsString()
  avatar?: string
}

export class RefreshDto {
  @IsString()
  refreshToken: string
}
