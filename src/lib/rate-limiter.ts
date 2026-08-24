/**
 * Upstream Rate Limiter & Request Queue
 * Guarantees that outgoing calls to https://api.sansekai.my.id/ never exceed 10 requests per minute.
 * Enforces a minimum interval between requests and queues pending requests.
 */

interface QueuedTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

class UpstreamRateLimiter {
  private queue: QueuedTask<any>[] = [];
  private processing = false;
  private minIntervalMs = 6200; // 6.2 seconds = max ~9.6 requests per minute (safe under 10 RPM)
  private lastRequestTime = 0;

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      const waitTime = Math.max(0, this.minIntervalMs - elapsed);

      if (waitTime > 0) {
        await new Promise((r) => setTimeout(r, waitTime));
      }

      this.lastRequestTime = Date.now();

      try {
        const result = await task.fn();
        task.resolve(result);
      } catch (err) {
        task.reject(err);
      }
    }

    this.processing = false;
  }
}

export const upstreamRateLimiter = new UpstreamRateLimiter();
