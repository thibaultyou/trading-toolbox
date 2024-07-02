import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { API_BEARER_AUTH_NAME } from '../auth/auth.constants';
import { ValidateAccount } from '../auth/decorators/account-auth.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletReadResponseDto } from './dtos/wallet-read.response.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallets')
@ApiBearerAuth(API_BEARER_AUTH_NAME)
@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController extends BaseController {
  constructor(private readonly walletService: WalletService) {
    super('Wallets');
  }

  @Get('/accounts/:accountId/wallets')
  @ApiOperation({ summary: 'Fetch wallets' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  getAccountWallets(@ValidateAccount() accountId: string): WalletReadResponseDto {
    return new WalletReadResponseDto(this.walletService.getWallets(accountId));
  }
}
