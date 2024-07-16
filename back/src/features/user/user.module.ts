import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONFIG_TOKEN, IEnvConfiguration } from '@config/env.config';

import { User } from './entities/user.entity';
import { PasswordService } from './services/password.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: IEnvConfiguration) => ({
        global: true,
        secret: config.JWT_SECRET,
        signOptions: { expiresIn: '4h' }
      }),
      inject: [CONFIG_TOKEN]
    })
  ],
  providers: [UserService, JwtStrategy, PasswordService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
