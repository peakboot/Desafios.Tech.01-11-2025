import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Transforma um parâmetro de query (string '1,2,3' ou '1') em um array de números [1, 2, 3].
 */
const TransformToArrayNumber = () =>
  Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(Number);
    }
    if (typeof value === 'number') {
      return [value];
    }
    return value;
  });

export class QueryParamsDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  // --- NOVOS FILTROS DA V2 (FASE 2.A) ---

  @IsOptional()
  @TransformToArrayNumber()
  @IsArray()
  @IsNumber({}, { each: true })
  channelIds?: number[];

  @IsOptional()
  @TransformToArrayNumber()
  @IsArray()
  @IsNumber({}, { each: true })
  storeIds?: number[];

  @IsOptional()
  @TransformToArrayNumber()
  @IsArray()
  @IsNumber({}, { each: true })
  dayOfWeek?: number[]; // PostgreSQL DOW: 0=Domingo, 1=Segunda, ..., 6=Sábado
}

