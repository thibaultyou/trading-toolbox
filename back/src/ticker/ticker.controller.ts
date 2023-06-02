import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExchangeService } from '../exchange/exchange.service';

@ApiTags('tickers')
@Controller('tickers')
export class TickerController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tickers' })
  async findAll(): Promise<string[]> {
    return this.exchangeService.getTickers();
  }
}
