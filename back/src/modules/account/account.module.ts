import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { AccountMapperService } from './services/account-mapper.service';

@Module({
  controllers: [AccountController],
  exports: [AccountService],
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [AccountService, AccountMapperService]
})
export class AccountModule {}
