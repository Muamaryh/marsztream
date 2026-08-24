/**
 * SingleFlight prevents duplicate concurrent in-flight requests.
 * If multiple callers request the same key while a request is in progress,
 * they all await the exact same promise instead of firing duplicate HTTP requests.
 */
class SingleFlightGroup {
  private inFlight = new Map<string, Promise<any>>();

  async do<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        return await fn();
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const singleFlight = new SingleFlightGroup();
