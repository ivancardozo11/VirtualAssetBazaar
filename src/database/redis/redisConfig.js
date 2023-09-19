import redis from 'redis';

export const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

console.log('Connecting to redis...🔌🔍🔍');

redisClient.on('ready', () => {
    console.log('Connected to Redis!🔌⚡');
});

redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

redisClient.connect();

export default redisClient;
