import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ValidateAccount } from '@account/decorators/account-validation.decorator';
import { AccountValidationGuard } from '@account/guards/account-validation.guard';
import { BaseController } from '@common/base.controller';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { WalletReadResponseDto } from './dtos/wallet-read.response.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallets')
@UseGuards(JwtAuthGuard, AccountValidationGuard)
@ApiBearerAuth()
@Controller('wallets')
export class WalletController extends BaseController {
  constructor(private readonly walletService: WalletService) {
    super('Wallets');
  }

  @Get('/accounts/:accountId/wallets')
  @ValidateAccount()
  @ApiOperation({ summary: 'Fetch wallets' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  getAccountWallets(@Param('accountId') accountId: string): WalletReadResponseDto {
    return new WalletReadResponseDto(this.walletService.getWallets(accountId));
  }
}
