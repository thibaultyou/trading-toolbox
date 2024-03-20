import { UseFilters, Controller } from '@nestjs/common';

import { HttpExceptionFilter } from '../exceptions/http-exceptions.filter';

@Controller()
@UseFilters(new HttpExceptionFilter())
export class BaseController {
  constructor(protected readonly moduleName: string) {}
}
