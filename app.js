const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');
const config = require('dotenv').config();
const helmet = require("helmet");

const MdbUser = process.env.Mdb_USER;
const MdbPassword = process.env.Mdb_PASSWORD;

//const rateLimiterMiddleware = require('./middleware/rateLimiterMiddleware');

mongoose.connect(`mongodb+srv://${MdbUser}:${MdbPassword}@cluster0.mezqp.mongodb.net/<dbname>?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());
app.use(helmet());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
// app.use('/api/auth', rateLimiterMiddleware, userRoutes);

module.exports = app;
