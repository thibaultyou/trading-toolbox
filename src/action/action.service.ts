import { Injectable } from '@nestjs/common';
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
    @InjectRepository(Setup)
    private setupRepository: Repository<Setup>,
  ) {}

  async create(actionCreate: CreateActionDto): Promise<Action> {
    const setup = await this.setupRepository.findOne({
      where: { id: actionCreate.setupId },
    });
    if (!setup) {
      throw new Error(`Setup with id: ${actionCreate.setupId} not found`);
    }
    const newAction = this.actionRepository.create(
      Action.fromDto(actionCreate),
    );
    newAction.setup = setup;
    return await this.actionRepository.save(newAction);
  }

  async findAll(): Promise<Action[]> {
    return await this.actionRepository.find();
  }

  async findOne(id: string): Promise<Action> {
    return await this.actionRepository.findOne({ where: { id } });
  }

  async updateAction(
    id: string,
    actionUpdate: UpdateActionDto,
  ): Promise<Action> {
    const action = await this.findOne(id);
    if (!action) {
      throw new Error(`Action with id: ${id} not found`);
    }
    Object.assign(action, actionUpdate);
    return await this.actionRepository.save(action);
  }

  async delete(id: string): Promise<void> {
    const action = await this.findOne(id);
    if (!action) {
      throw new Error(`Action with id: ${id} not found`);
    }
    await this.actionRepository.remove(action);
  }
}
