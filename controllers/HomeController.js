//
// Home Controller
//
var fs = require('fs');

var routeToHome = function(req, res){
  var ip = req.connection.remoteAddress;
  res.render('home/index', { user: req.user, ip: ip } ); 
};

module.exports = function(app) {
   // Home   
   app.route('/')
      .get(routeToHome);

   app.route('/home')
      .get(app.isLoggedIn, routeToHome);
};
