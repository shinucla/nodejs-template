var config = {};


config.web = {};
config.web.port = process.env.PORT || 80;

config.mongodb = {};
config.mongodb.url = 'mongodb://admin:test@ds061701.mongolab.com:61701/nodejs-express-auth';


//config.redis = {};
//config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];
//config.twitter.user_name = process.env.TWITTER_USER || 'username';
//config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';
//config.redis.uri = process.env.DUOSTACK_DB_REDIS;


config.admin               = {};
config.admin.firstname     = 'Shin';
config.admin.lastname      = 'Zhuang';
config.admin.email         = 'kevin@kevin.com';
config.admin.password      = 'test123';


module.exports = config;
