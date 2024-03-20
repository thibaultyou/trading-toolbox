import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { Action } from './entities/action.entity';
import {
  ActionCreateException,
  ActionNotFoundException,
  ActionUpdateException,
  ActionDeleteException,
} from './exceptions/action.exceptions';

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
    return this.actionRepository.save(newAction).catch((error) => {
      throw new ActionCreateException(error.message);
    });
  }

  async findAll(): Promise<Action[]> {
    return this.actionRepository.find().catch((error) => {
      throw new ActionNotFoundException(error.message);
    });
  }

  async findOne(id: string): Promise<Action> {
    return this.actionRepository
      .findOne({ where: { id } })
      .then((action) => {
        if (!action) {
          throw new ActionNotFoundException(id);
        }
        return action;
      })
      .catch((error) => {
        if (error instanceof ActionNotFoundException) {
          throw error;
        }
        throw new ActionNotFoundException(id);
      });
  }

  async update(id: string, actionUpdate: UpdateActionDto): Promise<Action> {
    const action = await this.findOne(id);
    Object.assign(action, actionUpdate);
    const updatedAction = this.actionRepository.merge(action, actionUpdate);
    return this.actionRepository.save(updatedAction).catch((error) => {
      throw new ActionUpdateException(id, error.message);
    });
  }

  async delete(id: string): Promise<void> {
    const action = await this.findOne(id);
    await this.actionRepository.remove(action).catch((error) => {
      throw new ActionDeleteException(id, error.message);
    });
  }
}
