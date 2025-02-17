import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AccountValidationGuard } from '@account/guards/account-validation.guard';
import { BaseController } from '@common/base.controller';
import { ValidateAccount } from '@common/decorators/account-validation.decorator';
import { Urls } from '@config';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { WalletDto } from './dtos/wallet.dto';
import { WalletMapperService } from './services/wallet-mapper.service';
import { WalletService } from './wallet.service';

@ApiTags('Wallets')
@UseGuards(JwtAuthGuard, AccountValidationGuard)
@ApiBearerAuth()
@Controller(`${Urls.ACCOUNTS}/:accountId/${Urls.WALLETS}`)
export class WalletController extends BaseController {
  constructor(
    private readonly walletService: WalletService,
    private readonly walletMapper: WalletMapperService
  ) {
    super('Wallets');
  }

  @Get()
  @ValidateAccount()
  @ApiOperation({ summary: 'Fetch wallets' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  getAccountWallets(@Param('accountId') accountId: string): WalletDto {
    const walletAccount = this.walletService.getWallets(accountId);
    return this.walletMapper.toDto(walletAccount);
  }
}
