var mongoose = require('mongoose');

//            camel                          table                            snake
module.exports.User         = mongoose.model('user',       require('./models/user-model.js'));
module.exports.UserProfile  = mongoose.model('user_profile', require('./models/user-profile-model.js'));
