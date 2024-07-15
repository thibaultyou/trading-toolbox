import { User } from '@auth/entities/user.entity';

export interface RequestWithUser extends Express.Request {
  user: User;
}
