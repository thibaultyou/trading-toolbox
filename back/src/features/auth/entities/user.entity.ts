import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Account } from '@account/entities/account.entity';

@Entity()
export class User {
  @ApiProperty({
    example: '3f309063-cfd1-4ce8-ad74-77c94b01563f',
    description: 'The unique identifier of the user'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user'
  })
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
}
