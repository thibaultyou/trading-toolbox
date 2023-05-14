// Setup.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupService } from './setup.service';
import { Setup } from './entities/setup.entity';
import { SetupController } from './setup.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setup])],
  providers: [SetupService],
  controllers: [SetupController],
  exports: [SetupService],
})
export class SetupModule {}
