var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');
var catalog = require('./routes/catalog');
var compression = require('compression');
var helmet = require('helmet');
var mongoDB = 'mongodb://mkeric:Trillium@ds153730.mlab.com:53730/local_library';

mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet());//sets some security headers (or removes some that emit some sensitive info)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());// add this AFTER the bodyParser middlewares
app.use(cookieParser());
app.use(compression());//compress all routes
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/catalog', catalog);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

//SET DEBUG=06-express-locallibrary-tutorial:* & nodemon start
// renamed folder for GIT, so use this instead:
// SET DEBUG=LocalLibrary:* & nodemon start
