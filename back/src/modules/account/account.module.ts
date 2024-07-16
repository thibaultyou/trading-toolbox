import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';

@Module({
  controllers: [AccountController],
  exports: [AccountService],
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [AccountService]
})
export class AccountModule {}
