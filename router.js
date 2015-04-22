
/**
 * Register controllers here.
*/

module.exports = function(app, passport) {
  
  app.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('returnUrl', req.url);
    res.redirect('/user/login');
  }
  
  require('./controllers/UserController')(app, passport); // MUST BE FIRST ONE for loading "remember me" middleware before rest of controller
  require('./controllers/HomeController')(app);
  //require('./controllers/AjaxController')(app, passport);
  
}
