import { ApiProperty } from '@nestjs/swagger';

export class AccountDeletedEvent {
    @ApiProperty()
    public readonly accountId: string;

    constructor(accountId: string) {
        this.accountId = accountId;
    }
}
