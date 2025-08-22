import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class CreateDrugDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === "" ? undefined : Number(value)))
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  genus?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;
}
