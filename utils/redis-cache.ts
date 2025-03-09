import Redis from "ioredis";

let redisClient: Redis | null = null;
const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL!);
    redisClient.on("error", (err) => console.log("Redis Error: ", err));
  }
  return redisClient;
};

const DEFAULT_EXPIRATION = 2 * 60;

export const getOrSetCache = async <T>(
  key: string,
  expiry: number = DEFAULT_EXPIRATION,
  fetchData: () => Promise<T>
): Promise<T> => {
  try {
    const redis = getRedisClient();
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const freshData = await fetchData();
    await redis.setex(key, expiry, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.error("Cache error:", error);
    return fetchData();
  }
};

export const clearCache = async (key: string) => {
  try {
    const redis = getRedisClient();
    if (await redis.exists(key)) {
      await redis.del(key);
    }
  } catch (error) {
    console.log("Cache Clear Error: ", error);
  }
};
