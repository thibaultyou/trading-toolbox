import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Balances } from 'ccxt';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import { logEffect, logError, logWarn } from '../logger/logger.utils';
import { BalanceGateway } from './balance.gateway';
import { BalancesUpdatedEvent } from './events/balances-updated.event';
import { extractUSDTEquity } from './utils/usdt-equity.util';

@Injectable()
//export class BalanceService implements OnModuleInit, IAccountTracker, IDataRefresher<Balances> {
export class BalanceService implements OnModuleInit, IAccountTracker {
  private logger = new Logger(BalanceService.name);
  private balances: Map<string, Balances> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private balanceGateway: BalanceGateway
  ) {}

  async onModuleInit() {
    setInterval(() => {
      this.refreshAll()();
    }, Timers.BALANCES_CACHE_COOLDOWN);
  }

  async startTrackingAccount(accountId: string): Promise<void> {
    if (!this.balances.has(accountId)) {
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
      await this.refreshOne(accountId)();
    } else {
      this.logger.warn(`Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.balances.delete(accountId)) {
      this.logger.log(`Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  getAccountBalances(accountId: string): Balances {
    this.logger.log(`Balances - Fetch Initiated - AccountID: ${accountId}`);

    if (!this.balances.has(accountId)) {
      this.logger.error(`Balances - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }
    return this.balances.get(accountId);
  }

  refreshOne = (accountId: string): TE.TaskEither<Error, Balances> =>
    pipe(
      TE.right(accountId),
      TE.tapIO(logEffect(this.logger, `Balances - Refresh Initiated - AccountID: ${accountId}`)),
      TE.flatMap(() => this.exchangeService.getBalances(accountId)),
      TE.flatMap((newBalances) =>
        pipe(
          TE.of(this.haveBalancesChanged(this.balances.get(accountId), newBalances)),
          TE.flatMap((hasChanged) =>
            hasChanged
              ? pipe(
                  TE.fromIO(() => {
                    this.balances.set(accountId, newBalances);
                    this.balanceGateway.sendBalancesUpdate(accountId, newBalances);
                    this.eventEmitter.emit(Events.BALANCES_UPDATED, new BalancesUpdatedEvent(accountId, newBalances));
                    logEffect(
                      this.logger,
                      `Balances - Updated - AccountID: ${accountId}, Balance (USDT): ${extractUSDTEquity(newBalances, this.logger).toFixed(2)} $`
                    )(newBalances);
                  }),
                  TE.map(() => newBalances)
                )
              : TE.right(newBalances)
          )
        )
      ),
      TE.tapError((error) =>
        logError(this.logger, `Balances - Update Failed - AccountID: ${accountId}, Error: ${error.message}`)(error)
      )
    );

  refreshAll = (): T.Task<void> =>
    pipe(
      T.of(void 0),
      T.chain(logEffect(this.logger, `Balances - Refresh Initiated`)),
      T.chain(() => T.of(Array.from(this.balances.keys()))),
      T.chain((accountIds) =>
        pipe(
          accountIds,
          A.traverse(T.ApplicativePar)((accountId) =>
            pipe(
              this.refreshOne(accountId),
              TE.fold(
                (error) => T.of({ accountId, success: false, error }),
                (balances) => T.of({ accountId, success: true, balances, error: null })
              )
            )
          )
        )
      ),
      T.map((results) => {
        const failures = results.filter((result) => !result.success);

        if (failures.length > 0) {
          const failedAccountIds = failures.map(({ accountId }) => accountId).join(', ');
          logWarn(
            this.logger,
            `Balances - Multiple Updates Failed - Count: ${failures.length}, AccountIDs: ${failedAccountIds}`
          );
        }
      })
    );

  haveBalancesChanged(currentBalances: Balances | undefined, newBalances: Balances): boolean {
    if (!currentBalances) return true;

    for (const key of Object.keys(newBalances)) {
      const currentBalance = currentBalances[key];
      const newBalance = newBalances[key];

      if (!currentBalance) return true;

      if (
        currentBalance.free !== newBalance.free ||
        currentBalance.used !== newBalance.used ||
        currentBalance.total !== newBalance.total ||
        (currentBalance.debt || 0) !== (newBalance.debt || 0)
      ) {
        return true;
      }
    }
    return false;
  }
}

// async refreshAll(): Promise<void> {
//   this.logger.log(`All Balances - Refresh Initiated`);
//   const accountIds = Array.from(this.balances.keys());
//   const errors: Array<{ accountId: string; error: Error }> = [];

//   const balancePromises = accountIds.map((accountId) =>
//     this.refreshOne(accountId).catch((error) => {
//       errors.push({ accountId, error });
//     })
//   );

//   await Promise.all(balancePromises);

//   if (errors.length > 0) {
//     const aggregatedError = new BalancesUpdateAggregatedException(errors);

//     this.logger.error(
//       `All Balances - Multiple Updates Failed - Errors: ${aggregatedError.message}`,
//       aggregatedError.stack
//     );
//     // NOTE Avoid interrupting the loop by not throwing an exception
//   }
// }

// getAccountUSDTEquity(accountId: string): USDTBalance {
//   this.logger.log(`Account Equity (USDT) Fetch Initiated - AccountID: ${accountId}`);

//   const balances = this.getAccountBalances(accountId);

//   if (!balances || !balances.USDT) {
//     this.logger.error(`Account Equity (USDT) Fetch Failed - AccountID: ${accountId}, Reason: USDT Field Not Found`);
//     throw new USDTBalanceNotFoundException(accountId);
//   }

//   const usdtEquity = extractUSDTEquity(balances, this.logger);
//   const usdtBalance = balances.USDT;

//   return {
//     equity: usdtEquity,
//     balance: usdtBalance
//   };
// }

// async refreshOne(accountId: string): Promise<Balances> {
//   this.logger.log(`Balances - Refresh Initiated - AccountID: ${accountId}`);

//   try {
//     const newBalances = await this.exchangeService.getBalances(accountId);
//     const currentBalances = this.balances.get(accountId);
//     const haveBalancesChanged = this.haveBalancesChanged(currentBalances, newBalances);

//     if (haveBalancesChanged) {
//       this.balances.set(accountId, newBalances);
//       this.balanceGateway.sendBalancesUpdate(accountId, newBalances);
//       this.eventEmitter.emit(Events.BALANCES_UPDATED, new BalancesUpdatedEvent(accountId, newBalances));
//       this.logger.log(
//         `Balances - Updated - AccountID: ${accountId}, Balance (USDT): ${extractUSDTEquity(newBalances, this.logger).toFixed(2)} $`
//       );
//     } else {
//       this.logger.debug(`Balances - Update Skipped - AccountID: ${accountId}, Reason: Unchanged`);
//     }

//     return newBalances;
//   } catch (error) {
//     this.logger.error(`Balances - Update Failed - AccountID: ${accountId}, Error: ${error.message}`, error.stack);
//     throw error;
//   }
// }

// async refreshOne(accountId: string): Promise<Balances> {
//   this.logger.log(`Balances - Refresh Initiated - AccountID: ${accountId}`);

//   const taskResult = await pipe(
//     this.exchangeService.getBalances(accountId),
//     TE.fold(
//       (error) => {
//         this.logger.error(`Balances - Update Failed - AccountID: ${accountId}, Error: ${error.message}`, error.stack);
//         return TE.left(error);
//       },
//       (newBalances) => {
//         const currentBalances = this.balances.get(accountId);
//         const haveBalancesChanged = this.haveBalancesChanged(currentBalances, newBalances);

//         if (haveBalancesChanged) {
//           this.balances.set(accountId, newBalances);
//           this.balanceGateway.sendBalancesUpdate(accountId, newBalances);
//           this.eventEmitter.emit(Events.BALANCES_UPDATED, new BalancesUpdatedEvent(accountId, newBalances));
//           this.logger.log(
//             `Balances - Updated - AccountID: ${accountId}, Balance (USDT): ${extractUSDTEquity(newBalances, this.logger).toFixed(2)} $`
//           );
//         } else {
//           this.logger.debug(`Balances - Update Skipped - AccountID: ${accountId}, Reason: Unchanged`);
//         }

//         return TE.right(newBalances);
//       }
//     )
//   )();

//   return pipe(
//     taskResult,
//     E.fold(
//       (error) => {
//         throw error;
//       },
//       (balances) => balances
//     )
//   );
// }
