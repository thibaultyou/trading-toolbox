import { ApiProperty } from '@nestjs/swagger';

export class CreateSetupDto {
    @ApiProperty()
    ticker: string;
}
