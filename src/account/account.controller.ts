// account.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

    @Get()
    @ApiOperation({ summary: 'Get all accounts' })
    async findAll(): Promise<Account[]> {
        return this.accountService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an account by ID' })
    async findOne(@Param('id') id: string): Promise<Account> {
        return this.accountService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new account' })
    @ApiBody({ type: CreateAccountDto })
    async create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
        return this.accountService.create(createAccountDto.name, createAccountDto.key, createAccountDto.secret);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an account' })
    @ApiBody({ type: UpdateAccountDto })
    async update(
        @Param('id') id: string,
        @Body() updateAccountDto: UpdateAccountDto,
    ): Promise<Account> {
        const { name, key, secret } = updateAccountDto;
        return this.accountService.update(id, name, key, secret);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an account by ID' })
    async delete(@Param('id') id: string): Promise<void> {
        return this.accountService.delete(id);
    }
}
