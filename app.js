const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const fs = require('fs');
const config = require('config');
const docPath = config.get('DOC_PATH');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

fs.readdir(`./${docPath}`, (err, files) => {
  files.forEach(file => {
    app.use(`/${file}`, function(req, res) {
      const swaggerDocument = YAML.load(path.join(__dirname, `/${docPath}/${file}`));
      res.setHeader('Access-Control-Allow-Origin', "*");
      res.send(swaggerDocument);
    })
  });

  app.use(
    '/', 
    swaggerUi.serve, 
    swaggerUi.setup(undefined, {
      swaggerUrls: files.map(file => {
        return {
          url: `http://${config.get('API_ADDRESS')}:${config.get('PORT')}/${file}`,
          name: file.split('-')[1]
        }
      })
  }));

  app.use(function(req, res, next) {
    next(createError(404));
  });
})

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
