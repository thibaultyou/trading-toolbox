import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

import { UserPasswordOperationException } from '@user/exceptions/user.exceptions';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  async hashPassword(password: string): Promise<string> {
    this.logger.debug('hashPassword() - start');

    try {
      const hashedPassword = await argon2.hash(password);
      this.logger.log('hashPassword() - success');
      return hashedPassword;
    } catch (error) {
      this.logger.error(`hashPassword() - error | msg=${error.message}`, error.stack);
      throw new UserPasswordOperationException('hash', error.message);
    }
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    this.logger.debug('verifyPassword() - start');

    try {
      const isPasswordValid = await argon2.verify(hashedPassword, plainTextPassword);
      this.logger.log(`verifyPassword() - success | isPasswordValid=${isPasswordValid}`);
      return isPasswordValid;
    } catch (error) {
      this.logger.error(`verifyPassword() - error | msg=${error.message}`, error.stack);
      throw new UserPasswordOperationException('verify', error.message);
    }
  }
}
