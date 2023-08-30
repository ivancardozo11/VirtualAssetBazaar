import redis from 'redis';

const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379
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
