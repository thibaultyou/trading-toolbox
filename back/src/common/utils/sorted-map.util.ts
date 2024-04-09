class SortedMap {
  private map: Map<string, number> = new Map();
  private values: number[] = [];

  set(key: string, value: number) {
    if (!this.map.has(key)) {
      const idx = this.values.findIndex((v) => v > value);

      if (idx === -1) {
        this.values.push(value);
      } else {
        this.values.splice(idx, 0, value);
      }
    }

    this.map.set(key, value);
  }

  get(key: string): number | undefined {
    return this.map.get(key);
  }

  getKeyByValue(value: number): string | undefined {
    for (const [key, val] of this.map.entries()) {
      if (val === value) return key;
    }

    return undefined;
  }

  getKeyByValueInRange(targetValue: number, range: number): string | undefined {
    const lowerBound = targetValue - range;
    const upperBound = targetValue + range;

    for (const [key, value] of this.map.entries()) {
      if (value >= lowerBound && value <= upperBound) return key;
    }

    return undefined;
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  delete(key: string): boolean {
    const value = this.map.get(key);

    if (value !== undefined) {
      const idx = this.values.indexOf(value);

      if (idx !== -1) {
        this.values.splice(idx, 1);
        this.map.delete(key);

        return true;
      }
    }

    return false;
  }

  sortedValues(): number[] {
    return [...this.values];
  }

  clear() {
    this.values = [];
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }

  forEach(callback: (value: number, key: string, map: Map<string, number>) => void) {
    for (const [key, value] of this.map.entries()) {
      if (value !== undefined) {
        callback(value, key, this.map);
      }
    }
  }

  firstEntry(): [string, number] | undefined {
    if (this.values.length === 0) return undefined;

    const firstValue = this.values[0];
    const entry = [...this.map.entries()].find(([_, v]) => v === firstValue);
    const firstKey = entry ? entry[0] : undefined;

    if (!firstKey) return undefined;

    return [firstKey, firstValue];
  }

  lastEntry(): [string, number] | undefined {
    if (this.values.length === 0) return undefined;

    const lastValue = this.values[this.values.length - 1];
    const entry = [...this.map.entries()].find(([_, v]) => v === lastValue);
    const lastKey = entry ? entry[0] : undefined;

    if (!lastKey) return undefined;

    return [lastKey, lastValue];
  }
}

export { SortedMap };
