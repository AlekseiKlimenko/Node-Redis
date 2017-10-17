var nconf = require('nconf');

nconf.argv()
    .env()
    .file('main', ABSPATH + '/index.json');

module.exports = nconf;