import redis from 'redis';

const redisClient = redis.createClient({
    host:'localhost',
    port: 6379,
});


redisClient.on('error', (err)=>{
    console.error('Error conecting to redis:', err);
});

export default redisClient;