import { Injectable } from '@nestjs/common';

@Injectable()
export class ExchangeEventThrottleService {
  private lastUpdateTimestamps = new Map<string, number>();

  canProcess(key: string, windowMs: number): boolean {
    const now = Date.now();
    const last = this.lastUpdateTimestamps.get(key) ?? 0;

    if (now - last < windowMs) {
      return false;
    }

    this.lastUpdateTimestamps.set(key, now);
    return true;
  }
}
