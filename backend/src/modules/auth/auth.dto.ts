import { IsString, IsOptional, MinLength } from 'class-validator'

export class LoginDto {
  @IsString() phone: string
  @IsString() password: string
}

export class RegisterDto {
  @IsString() phone: string
  @IsString() @MinLength(6) password: string
  @IsOptional() @IsString() nickname?: string
}

export class ChangePasswordDto {
  @IsString() oldPassword: string
  @IsString() @MinLength(6) newPassword: string
}

export class UpdateProfileDto {
  @IsOptional() @IsString() nickname?: string
  @IsOptional() @IsString() avatar?: string
}
