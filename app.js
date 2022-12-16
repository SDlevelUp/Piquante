const express = require('express');
const mongoose = require('mongoose');

const path = require('path');
const helmet = require('helmet');

const sanitize = require('express-mongo-sanitize');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const app = express();

const rateLimit = require('express-rate-limit')

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 100, 
	standardHeaders: true, 
	legacyHeaders: false, 
})

mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
      useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});


app.use(express.json());

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(helmet());
app.use('/api', apiLimiter)
app.use(sanitize());

module.exports = app;