import { Controller } from '@nestjs/common';

@Controller()
export class BaseController {
  constructor(protected readonly moduleName: string) {}
}
