 var log = require( INCPATH + '/log' )(module),
     config = require( INCPATH + '/config' ),
     Q = require('q');
// require('util').inherits(redisManager, require('events').EventEmitter);

var redisManager = function () {
    return function () {

        var self = this,
            msgGeneratorServer,
            eventHandler,
            client,
            msgListenServer;

        eventHandler = function(msg, callback){
            function onComplete(){
                var error = Math.random() > 0.85;
                callback(error, msg);
            };
            setTimeout(onComplete, Math.floor(Math.random() * 1000));
        };

        msgGeneratorServer = function () {
            self.genegayeMsg = setInterval(function () {
                function getMessage(){
                    self.cnt = self.cnt || 0;
                    return self.cnt++;
                };
                var message = getMessage();

                client.sadd('messages', message,  function (err) {
                    if (err) {
                        log.error(err);
                        client.end(true);
                    }
                    log.info('create new message:', message);
                });
            }, config.get('timeGenerateMessage'));
        };

        msgListenServer = function () {
            self.getMessage = setInterval(function () {
                client.spop('messages', function (err, res) {
                    if (res !== null){
                        log.info('Listen message: ', res);
                        eventHandler(res, function(err, res){
                            if (err){
                                log.info('error listen msg:', res);
                                client.sadd('errorMsgs', res,  function (err) {
                                    if (err){
                                        log.error(err);
                                        client.end(true);
                                    }
                                });
                            }
                        })
                    }else {
                        clearInterval(self.getMessage);
                        client.del('isRunMainClient');
                        log.error('Listen message error, current error', err);
                        client.end(true);
                    }
                });
            }, config.get('timeListeningMessage'));
        };

        this.startClient = function (mainClient) {
            client = mainClient;
            client.on("error", function (err) {
                if (err) {
                    log.error(err);
                    client.end(true);
                }
            });
            self.isCurrentServer().then(function (res) {
                if(res){
                    client.set('isRunMainClient', true, function (err, res) {
                        if(res){
                            log.info('====This is server generate message!====');
                            msgGeneratorServer();
                        }else {
                            log.error('Error set generate server');
                        }
                    });
                }else {
                    log.info('====This is server listening message!====');
                    msgListenServer();
                }
            });
        };

        this.isCurrentServer = function () {
           var deferred = Q.defer();
           client.getAsync('isRunMainClient').then(function(res, err) {
                if(res == null){
                    deferred.resolve(true);
                    log.info('create server');
                }else {
                    deferred.resolve(false);
                    log.info('is running main client', res);
                }
                if(err){
                    deferred.reject(err)
                    log.error('is get running main client error', err);
                    client.end(true);
                }
            });
            return deferred.promise;

        };
    }
};

module.exports = redisManager();