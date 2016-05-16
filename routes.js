var express = require('express');
var mysql = require('mysql');
var router = express.Router();

//conexion a mysql
var con = mysql.createConnection({
  host: process.env.OPENSHIFT_MYSQL_DB_HOST,
  user: process.env.OPENSHIFT_MYSQL_DB_USERNAME,
  password: process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
  database: process.env.OPENSHIFT_APP_NAME
});

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

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

router.get('/peliculas', function (req, res) {
  con.query('SELECT * FROM Pelicula', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

router.get('/peliculas/:id_pelicula', function (req, res) {
  var id_pelicula = req.params.id_pelicula;
  con.query('SELECT * FROM Pelicula WHERE Pelicula.idPelicula = " ' + id_pelicula + ' "', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});


module.exports = router;
