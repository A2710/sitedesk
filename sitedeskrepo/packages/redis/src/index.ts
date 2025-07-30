import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
dotenv.config();


export const redisClient: RedisClientType = createClient({ url: redisUrl });

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// Optionally, auto-connect (or call .connect() in your app bootstrap)
(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
})();
