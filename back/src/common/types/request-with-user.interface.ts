import { User } from '@user/entities/user.entity';

export interface RequestWithUser extends Express.Request {
  user: User;
}
