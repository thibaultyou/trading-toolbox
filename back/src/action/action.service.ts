import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Action } from './entities/action.entity';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { Setup } from '../setup/entities/setup.entity';

@Injectable()
export class ActionService {
  constructor(
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
  ) {}

  async create(actionCreate: CreateActionDto): Promise<Action> {
    const newAction = this.actionRepository.create(
      Action.fromDto(actionCreate),
    );
    return await this.actionRepository.save(newAction);
  }

  async findAll(): Promise<Action[]> {
    return await this.actionRepository.find();
  }

  async findOne(id: string): Promise<Action> {
    const action = await this.actionRepository.findOne({ where: { id } });
    if (!action) {
      throw new HttpException(
        `Action with id: ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return action;
  }

  async update(id: string, actionUpdate: UpdateActionDto): Promise<Action> {
    const action = await this.findOne(id);
    Object.assign(action, actionUpdate);
    return await this.actionRepository.save(action);
  }

  async delete(id: string): Promise<void> {
    const action = await this.findOne(id);
    await this.actionRepository.remove(action);
  }
}
