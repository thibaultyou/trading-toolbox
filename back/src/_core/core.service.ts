import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { ActionService } from '../_action/action.service';
import { ActionType } from '../_action/action.types';
import { Action } from '../_action/entities/action.entity';
import { Setup } from '../_setup/entities/setup.entity';
import { SetupService } from '../_setup/setup.service';
import { StatusType, TriggerType } from '../common/types/common.types';
import { Timers } from '../config';
import { BalanceService } from '../features/balance/balance.service';
import { ExchangeService } from '../features/exchange/exchange.service';
import { TickerService } from '../features/ticker/ticker.service';

@Injectable()
export class CoreService implements OnModuleInit {
  private logger = new Logger(CoreService.name);

  constructor(
    private tickerService: TickerService,
    private setupService: SetupService,
    private balanceService: BalanceService,
    private actionService: ActionService,
    private exchangeService: ExchangeService,
  ) {}

  async onModuleInit() {
    try {
      setInterval(async () => {
        await this.tradeLoop();
      }, Timers.TRADE_LOOP_COOLDOWN);
    } catch (error) {
      this.logger.error('Error during initialization', error.stack);
    }
  }

  private async tradeLoop() {
    try {
      const setups: Setup[] = (await this.setupService.findAll()).filter(
        (setup) => setup.status !== StatusType.DONE,
      );
      await Promise.all(setups.map(this.processSetup.bind(this)));
    } catch (error) {
      this.logger.error('Error during trade loop', error.stack);
    }
  }

  private async processSetup(setup: Setup) {
    await this.updateSetupStatus(setup);
    for (const action of setup.actions
      .filter((a) => a.status == StatusType.DONE)
      .sort((a, b) => a.order - b.order)) {
      await this.processAction(setup, action);
    }
    // await this.checkAndUpdateSetupStatus(setup);
  }

  private async checkAndUpdateSetupStatus(setup: Setup) {
    const pendingOrActiveActions = setup.actions.filter(
      (action) =>
        action.status == StatusType.PENDING ||
        action.status == StatusType.PAUSED ||
        action.status == StatusType.ACTIVE,
    );
    if (!pendingOrActiveActions.length) {
      await this.setupService.update(setup.id, {
        ...setup,
        status: StatusType.DONE,
      });
    }
  }

  private async updateSetupStatus(setup: Setup) {
    if (setup.status == StatusType.PENDING) {
      if (setup.trigger === TriggerType.NONE) {
        await this.activateSetup(setup);
      } else {
        await this.checkSetupTrigger(setup);
      }
    }
  }

  private async checkSetupTrigger(setup: Setup) {
    const currentTickerValue = this.tickerService.getTickerPrice(
      setup.account,
      setup.market,
    );
    if (
      (setup.trigger === TriggerType.CROSSING_UP &&
        currentTickerValue > setup.value) ||
      (setup.trigger === TriggerType.CROSSING_DOWN &&
        currentTickerValue < setup.value)
    ) {
      await this.activateSetup(setup);
    }
  }

  private async activateSetup(setup: Setup) {
    await this.setupService.update(setup.id, {
      ...setup,
      status: StatusType.ACTIVE,
    });
  }

  private async processAction(setup: Setup, action: Action) {
    if (action.status == StatusType.PENDING) {
      await this.updatePendingAction(setup, action);
    } else if (action.status == StatusType.ACTIVE) {
      await this.performActiveAction(setup, action);
      await this.actionService.update(action.id, {
        ...action,
        status: StatusType.DONE,
      });
    }
  }

  private async updatePendingAction(setup: Setup, action: Action) {
    const newAction = { ...action, status: StatusType.ACTIVE };
    if (!action.trigger) {
      await this.actionService.update(action.id, newAction);
    } else {
      const currentTickerValue = this.tickerService.getTickerPrice(
        setup.account,
        setup.market,
      );
      if (
        (action.trigger == TriggerType.CROSSING_UP &&
          currentTickerValue > Number(action.value)) ||
        (action.trigger == TriggerType.CROSSING_DOWN &&
          currentTickerValue < Number(action.value))
      ) {
        await this.actionService.update(action.id, newAction);
      }
    }
  }

  private async performActiveAction(setup: Setup, action: Action) {
    if (action.type == ActionType.MARKET_LONG) {
      const size = await this.calculateSize(setup, action);
      console.log('BUYING ', size);
      // this.exchangeService.openLongOrder(setup.ticker, size)
      await this.actionService.update(action.id, {
        ...action,
        status: StatusType.DONE,
      });
    } else if (action.type == ActionType.MARKET_SHORT) {
      // TODO: Add action for MARKET_SHORT
    }
  }

  private async calculateSize(setup: Setup, action: Action): Promise<number> {
    const tickerPrice = this.tickerService.getTickerPrice(
      setup.account,
      setup.market,
    );
    const actionValue = action.value;

    if (actionValue.includes('%')) {
      const balance = await this.balanceService.getOrRefreshAccountBalance(
        setup.account,
      );
      return (
        ((balance / 100) * Number(actionValue.replace('%', ''))) / tickerPrice
      );
    }

    if (actionValue.includes('$')) {
      return Number(actionValue.replace('$', '')) / tickerPrice;
    }

    return Number(actionValue);
  }
}
