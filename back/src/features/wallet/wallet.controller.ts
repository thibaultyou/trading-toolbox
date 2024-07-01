import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { WalletReadResponseDto } from './dto/wallet-read.response.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallets')
@Controller('wallets')
export class WalletController extends BaseController {
  constructor(private readonly walletService: WalletService) {
    super('Wallets');
  }

  @Get('/accounts/:accountId/wallets')
  @ApiOperation({ summary: 'Fetch wallets' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  getAccountWallets(@Param('accountId') accountId: string): WalletReadResponseDto {
    return new WalletReadResponseDto(this.walletService.getWallets(accountId));
  }
}
