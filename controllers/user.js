/************************* CONTROLLERS / USER *************************/

require("dotenv").config();

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const cryptojs = require('crypto-js')
console.log(process.env.CRYPTOJS_EMAIL)


exports.signup = (req, res, next) => {
  const cryptEmail = cryptojs.HmacSHA256(req.body.email, process.env.CRYPTOJS_EMAIL).toString();
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: cryptEmail,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'User create' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  const decryptEmail = cryptojs.HmacSHA256(req.body.email, process.env.CRYPTOJS_EMAIL).toString();
  User.findOne({ email: decryptEmail })
      .then(user => {
          if (!user) {
              return res.status(401).json({ error: 'Incorrect username/password pair' });
          }
          bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                  if (!valid) {
                      res.status(401).json({ error: 'Incorrect username/password pair' });
                  } else {
                  res.status(200).json({
                      userId: user._id,
                      token: jwt.sign(
                          { userId: user._id },
                          process.env.JWT_SECRET,
                          { expiresIn: '24h' }
                      )
                  });
                }
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};