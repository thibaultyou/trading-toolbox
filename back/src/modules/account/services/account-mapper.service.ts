import { Injectable } from '@nestjs/common';

import { maskString } from '@account/account.utils';
import { AccountCreateRequestDto } from '@account/dtos/account-create.request.dto';
import { AccountUpdateRequestDto } from '@account/dtos/account-update.request.dto';
import { AccountDto } from '@account/dtos/account.dto';
import { Account } from '@account/entities/account.entity';
import { IBaseMapper } from '@common/interfaces/base-mapper.interface';
import { User } from '@user/entities/user.entity';

@Injectable()
export class AccountMapperService
  implements IBaseMapper<Account, AccountDto, AccountCreateRequestDto, AccountUpdateRequestDto>
{
  toDto(account: Account): AccountDto {
    const dto = new AccountDto();
    dto.id = account.id;
    dto.name = account.name;
    dto.key = maskString(account.key);
    dto.exchange = account.exchange;
    return dto;
  }

  createFromDto(dto: AccountCreateRequestDto, user: User): Account {
    const account = new Account();
    account.name = dto.name;
    account.key = dto.key;
    account.secret = dto.secret;
    account.passphrase = dto.passphrase || null;
    account.exchange = dto.exchange;
    account.user = user;
    return account;
  }

  updateFromDto(account: Account, dto: AccountUpdateRequestDto): Account {
    if (dto.name !== undefined) {
      account.name = dto.name;
    }

    if (dto.key !== undefined) {
      account.key = dto.key;
    }

    if (dto.secret !== undefined) {
      account.secret = dto.secret;
    }

    if (dto.passphrase !== undefined) {
      account.passphrase = dto.passphrase;
    }

    if (dto.exchange !== undefined) {
      account.exchange = dto.exchange;
    }
    return account;
  }
}
