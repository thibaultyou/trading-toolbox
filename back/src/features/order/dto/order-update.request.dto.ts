import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class OrderUpdateRequestDto {
  @ApiProperty({
    description: 'The volume of the order.',
    example: 1.5,
    type: 'number'
  })
  @IsOptional()
  @IsNumber({}, { message: 'Volume must be a number.' })
  @IsPositive({ message: 'Volume must be positive.' })
  volume?: number;

  @ApiProperty({
    description: 'The limit price for the order, optional.',
    example: 10000,
    type: 'number',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number if specified.' })
  @IsPositive({ message: 'Price must be positive if specified.' })
  price?: number;
}
