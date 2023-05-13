import { ApiProperty } from '@nestjs/swagger';

export class AlertReceivedEvent {
    @ApiProperty()
    public readonly test: string;

    constructor(test: string) {
        this.test = test;
    }
}
