import { IsString, IsNumber, IsOptional, IsArray, Min, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateProductDto {
  @IsString() name: string
  @IsOptional() @IsString() desc?: string
  @IsNumber() @Min(0) @Type(() => Number) price: number
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) originalPrice?: number
  @IsOptional() @IsString() category?: string
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[]
  @IsOptional() @IsArray() images?: string[]
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) stock?: number
  @IsOptional() @IsEnum(['active', 'inactive']) status?: string
}

export class UpdateProductDto extends CreateProductDto {}

export class CreateCategoryDto {
  @IsString() name: string
  @IsString() slug: string
  @IsOptional() @IsString() icon?: string
  @IsOptional() @IsNumber() @Type(() => Number) sort?: number
}

export class UpdateCategoryDto extends CreateCategoryDto {}
