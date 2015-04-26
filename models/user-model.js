//
// User Schema
//
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var schema = mongoose.Schema({
   // general
   firstname      : String,
   lastname       : String,

   status_bit     : Number,   // 0: delete 1: active 2: inactive
   role           : String,   // lower case: admin, canread, canwrite
   rememberme     : String,   // _rme cookie hashed token
   login_attempts : Number,
   locked_until   : Date,
   userdetail     : {type: mongoose.Schema.Types.ObjectId, ref: 'user_profile'},

   // credential
   local          : {
      email       : String,
      password    : String
   },
   facebook       : {
      id          : String,
      token       : String,
      email       : String,
      name        : String
   },
   twitter        : {
      id          : String,
      token       : String,
      displayName : String,
      username    : String
   },
   google         : {
      id          : String,
      token       : String,
      email       : String,
      name        : String
   }
});


MAX_LOGIN_ATTEMPTS = 5;
var LOCKED_TIME = 1000 * 60 * 60 * 2;  // two hours


// public member methods
//   Domain.User user = new User(); 
//   user.validPassword(xxx);
schema.methods.validPassword = function(password) {
   return bcrypt.compareSync(password, this.local.password);
};

// public static methods
//   Domain.User.generateHash(xxx)
schema.statics.generateHash = function(password) {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.statics.signupUser = function(jsonUser, callback) {
  // callback(Error, Domain.User entity)
  var regex    = new RegExp(["^", jsonUser.email, "$"].join(""), "i");
  
  Domain
    .User
    .findOne({'local.email': regex }, function(err, user) {
      if (err) return callback(err.toString(), null);
      if (user) return callback('That email is already taken.', null);
      
      // if there is no user with that email
      var newUser            = new Domain.User();
      newUser.local.email    = jsonUser.email;
      newUser.local.password = Domain.User.generateHash(jsonUser.password);
      newUser.firstname      = jsonUser.firstname;
      newUser.lastname       = jsonUser.lastname;
      newUser.login_attempts = 1;
      newUser.role           = 'member';
      
      newUser.save(function(err) {
        if (err) throw err;
        
        return callback(null, newUser);
      });
    });
};

schema.statics.loginUser = function(jsonUser, callback) {
  // callback(Error, Domain.User entity)
  var regex = new RegExp(["^", jsonUser.email, "$"].join(""), "i");
  
  Domain
    .User
    .findOne({'local.email': regex}, function(err, user) {
      if (err || !user) return callback('The email or password you entered is incorrect.', null);
      
      // User Found With Locked Account
      if (Date.now() < user.locked_until) { 
        return callback('This account has been locked until ' + user.locked_until, null);
      } 

      // User Found with Correct Password
      if (user.validPassword(jsonUser.password)) { 
        return Domain // this return here is very important!!!
          .User
          .update({_id: user._id}, {login_attempts : 1}, function(err, num) {
            if (err) throw err;
            return callback(null, user);   // to access user in router: req.user, then it will be passed to 'user' in view
          });
      } 

      // User Found With Incorrect Password
      // and MAX_LOGIN_ATTEMPTS <= Login Attempts
      if (MAX_LOGIN_ATTEMPTS <= user.login_attempts) { 
        return Domain
          .User
          .update({_id: user._id}, {login_attempts: 1, locked_until: Date.now() + LOCKED_TIME}, function(err, num) {
            if(err) throw err;
            return callback('This account has been locked.', null);
          });

        // Login Attempts < MAX_LOGIN_ATTEMPTS
      } else { 
        return Domain
          .User
          .update({_id: user._id}, {$inc: {login_attempts: 1}}, function(err, num) {
            if(err) throw err;
            return callback('This account will be locked after ' + 
                            (MAX_LOGIN_ATTEMPTS - user.login_attempts) + 
                            ' more failed logins.', null);
          });
      }
    });
};

module.exports  = schema;
