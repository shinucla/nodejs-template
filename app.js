//
// app.js
// @author Kevin Zhuang
// @version 
// @since 04/17/2015
//

// MAIN ENTRY
//=======================================================================
var config        = require('./config.js');
var express       = require('express');
var http          = require('http');
var mongoose      = require('mongoose');
var passport      = require('passport');
var flash         = require('connect-flash');

var bodyParser    = require('body-parser');
var cookieParser  = require('cookie-parser');
var session       = require('express-session');



// CONFIG
//=======================================================================
var app = express();
http.createServer(app).listen(config.web.port);  //$sudo PORT=8080 node app.js
//https.createServer(options, app).listen(443);

app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public')); //js css img fonts...
app.use(cookieParser());
app.use(session( {secret: 'my_super_secrete_word', resave: true, saveUninitialized: true } ));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



// Domain Models + Data Access Layer
//=======================================================================
Domain = require('./domain-models.js');

//mongoose.connect('192.168.2.10:27017/db', function(err) {
mongoose.connect(config.mongodb.url, function(err) {
  if (err) {
    console.log('Cannot connect to mongodb');
    process.exit(1);
  }
  console.log('Successfully connected to the mongodb');
});




// AUTHENTICATION
//=======================================================================
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./config-passport.js')(passport);




//MIDDLE WARES 
//=======================================================================
var myMiddleWare = function(req, res, next) {
    //console.log('Hello world to myMiddleWare!!!');
    return next();
};

//RememberMe = require('./remember-me.js');
//app.use(RememberMe.LoadRememberMe); // check UserController.js setRememberMe function
app.use(myMiddleWare);




// CONTROLLERS
//=======================================================================
require('./router.js')(app, passport);

