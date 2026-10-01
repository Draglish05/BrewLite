import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { SIZE_NAMES, TOPPING_NAMES } from '../pricing';

// 1 món khách gửi lên
export class OrderItemDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsIn(SIZE_NAMES, { message: 'size chỉ được là S, M hoặc L' })
  size: string;

  @IsArray()
  @IsIn(TOPPING_NAMES, { each: true, message: 'topping không hợp lệ' })
  toppings: string[];

  @IsInt()
  @Min(1)
  @Max(20)
  qty: number;
}

// Cả giỏ hàng khách gửi lên
export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Giỏ hàng phải có ít nhất 1 món' })
  @ValidateNested({ each: true }) // kiểm tra từng món bên trong
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
