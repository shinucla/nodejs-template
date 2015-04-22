//
// User Profile Schema
//
var mongoose = require('mongoose');

var schema = mongoose.Schema({
   uid            : {type: mongoose.Schema.Types.ObjectId},
   avatar         : {mime: String, bin: Buffer}
});

module.exports = schema;
