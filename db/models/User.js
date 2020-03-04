const mongoose = require('../connection');

const UserSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
