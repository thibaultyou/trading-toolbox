import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Account {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    key: string;

    @ApiProperty()
    @Column()
    secret: string;

    constructor(name: string, key: string, secret: string) {
        this.name = name;
        this.key = key;
        this.secret = secret;
    }
}
