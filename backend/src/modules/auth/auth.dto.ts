import { IsString, IsOptional, MinLength, Matches, ValidateBy, ValidationOptions } from 'class-validator'

function IsSafeUrl(validationOptions?: ValidationOptions) {
  return ValidateBy({
    name: 'isSafeUrl',
    validator: {
      validate(value: string) {
        if (!value || typeof value !== 'string') return true
        const trimmed = value.trim().toLowerCase()
        if (trimmed.startsWith('javascript:')) return false
        if (trimmed.startsWith('data:')) return false
        if (trimmed.startsWith('vbscript:')) return false
        if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) return false
        return true
      },
      defaultMessage() {
        return '头像URL必须是有效的http/https URL，不允许使用javascript:或data:协议'
      },
    },
  }, validationOptions)
}

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
  @IsSafeUrl()
  avatar?: string
}

export class RefreshDto {
  @IsString()
  refreshToken: string
}
