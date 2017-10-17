global.ABSPATH = __dirname;
global.INCPATH = ABSPATH + '/libs';

var log = require( INCPATH + '/log' )(module),
    redis = require("redis"),
    client = redis.createClient(),
    redisClient = require( INCPATH + '/redisClient' ),
    Promise = require("bluebird");

var redisCreateClient = new redisClient();
Promise.promisifyAll(require("redis"));

redisCreateClient.startClient(client);