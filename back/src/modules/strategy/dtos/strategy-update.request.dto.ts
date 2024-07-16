import { PartialType } from '@nestjs/swagger';

import { StrategyCreateRequestDto } from './strategy-create.request.dto';

export class StrategyUpdateRequestDto extends PartialType(StrategyCreateRequestDto) {}
