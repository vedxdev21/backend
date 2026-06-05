import Redis from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

try {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed after 3 retries. Running without Redis.');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    console.warn('⚠️ Redis error:', err.message);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });
} catch {
  console.warn('⚠️ Redis not available. Running without cache.');
}

// Graceful fallback — all operations are no-ops if Redis is unavailable
export const cache = {
  async get(key: string): Promise<string | null> {
    try {
      return redis ? await redis.get(key) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (!redis) return;
      if (ttlSeconds) {
        await redis.set(key, value, 'EX', ttlSeconds);
      } else {
        await redis.set(key, value);
      }
    } catch {
      // silently fail
    }
  },

  async del(key: string): Promise<void> {
    try {
      if (redis) await redis.del(key);
    } catch {
      // silently fail
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      return redis ? (await redis.exists(key)) === 1 : false;
    } catch {
      return false;
    }
  },

  getClient(): Redis | null {
    return redis;
  },
};

export default cache;
