import redisClient from "../redis/redisConfig";

redisClient.set('key', 'value', 'EX', 3600);

redisClient.get('key', (err, result)=> {
    if(err){
        console.error('Error getting value from redis', err);
    } else {
        console.log('Value stored on Redis:', result);
      }
});