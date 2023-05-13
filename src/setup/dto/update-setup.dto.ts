import { ApiProperty } from '@nestjs/swagger';

export class UpdateSetupDto {
    @ApiProperty()
    ticker: string;
}
