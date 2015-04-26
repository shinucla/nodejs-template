// Three pieces need to be configured to use Passport for authentication:
//
// 1. Authentication strategies
// 2. Application middleware
// 3. Sessions (optional)
//
// After authenticated, the passport will create:
//      req.user, req.isAuthenticated(), etc..

/**

Step 1: declare authenticate strategies.
passport.use( 'strategy_name', new XxxxStrategy(authenticate_function(xxx, yyy, next){
   .....
   .....
   depends on your strategy you use, the xxx, yyy might be different
   but you need to use xxx, yyy to see if they match whats in your database.
   if it does, then find that entity: user
   
   next(null, user); ----> this will invoke passport.serializeUser(with the user passed in by 'next')
});

Step2: serialize the id of the entity user
hence, take the entity 'user', serialize part of it, usually 'id', and put it into session variable
passport.serializeUser(function(user, done) {
  user ===> userJson, i.e. {uid: user._id, test: 'test test'}
  
  done(null,  userJson );   // serialize obj into session cookie
}); 

Step3: deserialize to get entity user
here, if session contain serilized user parts, usually 'id',
deserialize it, and see if we can retrieve the real entity 'user' from database
passport.deserializeUser(function(userJson, done) {
  userJson ==> user
  done(null, user);
});

Step4: pass the middleware
now, as middleware that you need it to exame authentication:
app.route('/ttt/uuu')
   .get(passport.authenticate('strategy_name'), function(req, res) {
     // alsdfasl;dfkjasld
   });


*/

var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;   // simple and basic
var OauthStrategy = require('passport-http-oauth').Strategy;
var Oauth2Strategy = require('passport-http-bearer').BearerStrategy;

MAX_LOGIN_ATTEMPTS = 5;
var LOCKED_TIME = 1000 * 60 * 60 * 2;  // two hours


function CapFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
}

// serialize obj into session cookie
function serializeUser(user, done) {
  done(null,  {uid: user._id, test: 'test test'} );   
}

// deserialize req.user from cookie
function deserializeUser(cookieObject, done) {
  var uid = cookieObject.uid; // uid is defined in above session cookie
  
  Domain
    .User
    .findById(uid)
    .exec(function(err, user) { 
      done(err, user);
    });
}

// Signup function
function signupUser(jsonUser, req, passportSignupCallback) {
  Domain.User.signupUser(jsonUser, function(errMessage, user) {
    if (!!errMessage || !user) {
      return passportSignupCallback(null, false, req.flash('signupMessage', errMessage));

    } else {
      return passportSignupCallback(null, user);
    }
  });
}
  
// login function
function loginUser(jsonUser, req, passportLoginCallback) {
  Domain.User.loginUser(jsonUser, function(errMessage, user) {
    if (!!errMessage) {
      return passportLoginCallback(null, false, req.flash('loginMessage', errMessage));

    } else {
      return passportLoginCallback(null, user);
    }
  });
}
  
function apiLoginUser(jsonUser, req, passportApiLoginCallback) {
  Domain.User.loginUser(jsonUser, function(errMessage, user) {
    if (errMessage) {
      return passportApiLoginCallback(null, null);

    } else {
      return passportApiLoginCallback(null, user);
    }
  });
}


module.exports = function(passport) {

  /*@Override*/ passport.serializeUser(serializeUser);

  /*@Override*/ passport.deserializeUser(deserializeUser);
  
  passport.use('my-local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField     : 'email',
    passwordField     : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  }, function(req, email, password, done) {
    var jsonUser  = {'email': email, 
                     'password': password,
                     'firstname': CapFirstLetter(req.body.firstname),
                     'lastname': CapFirstLetter(req.body.lastname)};
    
    return signupUser(jsonUser, req, done);
  }));
  
  passport.use('my-local-login', new LocalStrategy({
    usernameField     : 'email',
    passwordField     : 'password',
    passReqToCallback : true 
  }, function(req, email, password, done) { // callback with email and password from our form
    var jsonUser  = {'email': email, 
                     'password': password};

    return loginUser(jsonUser, req, done);
  }));
  
  passport.use('api-local-login2', new LocalStrategy({
    usernameField     : 'email',
    passwordField     : 'password',
    passReqToCallback : true 
  }, function(req, email, password, done) { // callback with email and password from our form
    var jsonUser  = {'email': email, 
                     'password': password};

    return apiLoginUser(jsonUser, req, done);
  }));
  
};


