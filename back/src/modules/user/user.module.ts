import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@config';

import { User } from './entities/user.entity';
import { PasswordService } from './services/password.service';
import { UserMapperService } from './services/user-mapper.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.env.JWT_SIGNING_SECRET,
        signOptions: { expiresIn: '4h' }
      })
    })
  ],
  providers: [UserService, UserMapperService, JwtStrategy, PasswordService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
