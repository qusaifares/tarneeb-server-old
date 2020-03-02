const express = require('express');
const User = require('../db/models/User');
const router = express.Router();

router.get('/', (req, res) => {
  User.find({}).then(data => res.json(data));
});

router.post('/create', (req, res) => {
  console.log(req.body);
  const user = {
    username: req.body.username,
    password: req.body.password
  };
  User.create(user).then(data => res.json(data));
});

module.exports = router;
