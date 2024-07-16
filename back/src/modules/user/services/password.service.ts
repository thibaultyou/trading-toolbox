import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  async hashPassword(password: string): Promise<string> {
    this.logger.debug('Hashing password');

    try {
      const hashedPassword = await argon2.hash(password);
      this.logger.debug('Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      this.logger.error(`Error hashing password: ${error.message}`, error.stack);
      throw new Error('Failed to hash password');
    }
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    this.logger.debug('Verifying password');

    try {
      const isPasswordValid = await argon2.verify(hashedPassword, plainTextPassword);
      this.logger.debug(`Password verification result: ${isPasswordValid}`);
      return isPasswordValid;
    } catch (error) {
      this.logger.error(`Error verifying password: ${error.message}`, error.stack);
      throw new Error('Failed to verify password');
    }
  }
}
