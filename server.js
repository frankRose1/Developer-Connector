require('dotenv').config({ path: '.env' });

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const port = process.env.PORT || 5000;
//import models
require('./models/User');
require('./models/Profile');
require('./models/Post');
//routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const {
  notFound,
  validationErrors,
  globalErrorHandler
} = require('./handlers/errors');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, PUT, POST, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//passport middleware
app.use(passport.initialize());
require('./handlers/passport')(passport);

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

//error handlers
app.use(notFound);
app.use(validationErrors);
app.use(globalErrorHandler);

mongoose
  .connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  })
  .catch(err => console.log(`Error connecting to DB ${err}`));
