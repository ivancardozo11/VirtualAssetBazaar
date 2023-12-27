import redis from 'redis';

function getRedisUrl () {
    if (process.env.NODE_ENV === 'production') {
        return 'redis://redis:6379';
    } else {
        return 'redis://127.0.0.1:6379';
    }
}

const redisClient = redis.createClient({
    url: getRedisUrl()
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
