//
// User Controller
//
var ObjectID   = require('mongoose').Types.ObjectId;
var fs         = require('fs');
var gm         = require('gm');


var loadRememberMe = function(req, res, next) {
  if (req.user) return next();
  
  var rememberme_token = req.cookies._rme; 
  if (!rememberme_token) return next();
  
  Domain.User.findOne({rememberme: rememberme_token}, function(err, user) {
    if (err) {
      res.clearCookie('_rme');
      return next();
    }
    req.login(user, function(err) {
      if (err) return next();

      var returnUrl = req.flash('returnUrl');
      if (returnUrl == undefined || returnUrl == null || returnUrl.length == 0)
        res.redirect(301, '/home');
      else
        res.redirect(301, returnUrl);
    });
  });
};

var setRememberMe = function(req, res, next) {
  if (!req.body.rememberme) {
    res.clearCookie('_rme');
    return next();
  }
  var token = Domain.User.generateHash(req.user._id + Date.now());
  Domain.User.update({_id: req.user._id}, {rememberme: token}, function(err, num) {
    if (err) return next();

    res.cookie('_rme', token, {path: '/', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7});   // 7 days remember me cookie
    return next();
  });
};



module.exports = function(app, passport) {
  // Remember me
  app.use(loadRememberMe);

  // Login
  app.route('/user/login')
    .get(function(req, res) { 
      res.render('user/login', { message: req.flash('loginMessage'), /*csrf: req.csrfToken()*/ });
    })
  
    .post(
      passport.authenticate('my-local-login', {
        //successRedirect    : '/home', 
        failureRedirect      : '/user/login',   
        failureFlash         : true // allow flash messages
      }), 
      
      //RememberMe.SetRememberMe,
      setRememberMe,
      
      function(req, res) {
        var returnUrl = req.flash('returnUrl');
        if (returnUrl == undefined || returnUrl == null || returnUrl.length == 0)
          res.redirect(301, '/home');
        else
          res.redirect(301, returnUrl);
      });
  
  // Signup
  app.route('/user/signup')
    .get(function(req, res) {
      res.render('user/signup', { message: req.flash('signupMessage'), /*csrf: req.csrfToken()*/ });
    })
  
    .post(passport.authenticate('my-local-signup', {
      successRedirect      : '/home', 
      failureRedirect      : '/user/signup', 
      failureFlash         : true // allow flash messages
    }));
  
  // Logout
  app.route('/user/logout')
    .get(function(req, res) {
      res.clearCookie('_rme');
      req.logout();
      res.redirect('/home');
    });
  
};




