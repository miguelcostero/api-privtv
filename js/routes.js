var express = require('express');
var mysql = require('mysql');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', function(req, res) {
  res.send('API home page');
});

router.get('/empleados', function (req, res) {
  con.query('SELECT * FROM Empleado', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'routerlication/json');
    res.send(rows);
  });
});

router.get('/peliculas', function (req, res) {
  con.query('SELECT * FROM Pelicula', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'routerlication/json');
    res.send(rows);
  });
});

router.get('/peliculas/:id', function (req, res) {

});


module.exports = router;
