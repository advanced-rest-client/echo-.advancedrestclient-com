'use strict';

// Activate Google Cloud Trace and Debug when in production
if (process.env.NODE_ENV === 'production') {
  require('@google-cloud/trace-agent').start();
  require('@google-cloud/debug-agent');
}

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bb = require('express-busboy');
const logging = require('./lib/logging');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');

const app = express();
app.enable('trust proxy');
app.disable('etag');

var sessionInit = {
  secret: 'e146810e-6996-11e7-907b-a6006ad3dba0',
  resave: false,
  saveUninitialized: false,
  cookie: {}
};
if (process.env.NODE_ENV === 'production') {
  sessionInit.cookie.secure = true;
}

app.use(cookieParser());
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
bb.extend(app); // For multipart queries.
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(sessionInit));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use('/cookies', require('./routes/cookies'));
app.use('/auth/oauth1', require('./routes/oauth1'));
app.use('/.well-known/', require('./routes/letsencrypt'));

app.set('x-powered-by', false);

app.use(logging.requestLogger);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  console.error(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
