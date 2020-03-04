const express = require('express');
const User = require('../db/models/User');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  User.find({}).then(data => res.json(data));
});

router.post('/create', async (req, res) => {
  console.log(req.body);
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      username: req.body.username,
      password: hashedPassword
    };
    User.create(user).then(data => res.json(data));
  } catch {
    res.status(500).send();
  }
});

router.post('/login', async (req, res) => {
  console.log(req.body);
  const user = await User.findOne({ username: req.body.username });
  console.log('user', user);
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      console.log('success');
      res.json({ username: user.username });
    } else {
      console.log('Fail');
      res.send('Not allowed');
    }
  } catch {
    res.status(500).send();
  }
});

module.exports = router;
