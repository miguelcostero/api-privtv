var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var s_ = require("underscore.string");
var mysql = require('mysql');
var router = express.Router();
var app = express();

//conexion a mysql
var host_mysql, user_mysql, password_mysql, database_mysql;

host_mysql = process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost';
user_mysql = process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root';
password_mysql = process.env.OPENSHIFT_MYSQL_DB_PASSWORD || '1232';
database_mysql = process.env.OPENSHIFT_APP_NAME || 'api';

var con = mysql.createConnection({
  host: host_mysql,
  user: user_mysql,
  password: password_mysql,
  database: database_mysql
});

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

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

router.get('/empleados/:id_empleado', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  con.query('SELECT * FROM Empleado WHERE empleado.idEmpleado = " ' + req.params.id_empleado + ' "', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.send({ "mensaje": "No existe el id '" + req.params.id_pelicula + "' en la base de datos." });
    } else {
      res.send(rows);
    }
  });
});

//rutas de las peliculas
router.get('/peliculas', function (req, res) {
  con.query('SELECT * FROM Pelicula', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

router.get('/peliculas-populares', function (req, res) {
  con.query('SELECT Pelicula.*, contaRepro(Pelicula.idPelicula) AS numReproducciones FROM Pelicula ORDER BY numReproducciones DESC', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

router.get('/peliculas-nuevas', function (req, res) {
  con.query('SELECT Pelicula.* FROM Pelicula ORDER BY (Pelicula.fecha_hora_publicacion) DESC', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

router.get('/peliculas-alfabeticamente', function (req, res) {
  con.query('SELECT Pelicula.* FROM Pelicula ORDER BY Pelicula.nombre ASC', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

router.get('/peliculas/:id_pelicula', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  con.query('SELECT * FROM Pelicula WHERE Pelicula.idPelicula = " ' + req.params.id_pelicula + ' "', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.send({ "mensaje": "No existe el id '" + req.params.id_pelicula + "' en la base de datos." });
    } else {
      res.send(rows);
    }
  });
});

router.get('/pelicula-generos/:id_pelicula', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  con.query('SELECT Genero.Nombre FROM Genero INNER JOIN Genero_Pelicula ON Genero.idGenero = Genero_Pelicula.Genero_idGenero INNER JOIN Pelicula ON Genero_Pelicula.Pelicula_idPelicula = Pelicula.idPelicula WHERE Pelicula.idPelicula = " ' + req.params.id_pelicula + ' "', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.send({ "mensaje": "No existe el id '" + req.params.id_pelicula + "' en la base de datos." });
    } else {
      res.send(rows);
    }
  });
});

router.get('/pelicula-actores/:id_pelicula', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  con.query('SELECT Actor.*, Actor_Pelicula.Personaje FROM Actor INNER JOIN Actor_Pelicula ON Actor.idActor = Actor_Pelicula.Actor_idActor INNER JOIN Pelicula ON Actor_Pelicula.Pelicula_idPelicula = Pelicula.idPelicula WHERE Pelicula.idPelicula = " ' + req.params.id_pelicula + ' "', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.send({ "mensaje": "No existe el id '" + req.params.id_pelicula + "' en la base de datos." });
    } else {
      res.send(rows);
    }
  });
});

router.get('/pelicula-directores/:id_pelicula', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  con.query('SELECT Director.* FROM Director INNER JOIN Director_Pelicula ON Director.idDirector = Director_Pelicula.Director_idDirector INNER JOIN Pelicula ON Director_Pelicula.Pelicula_idPelicula = Pelicula.idPelicula WHERE Pelicula.idPelicula = " ' + req.params.id_pelicula + ' "', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.send({ "mensaje": "No existe el id '" + req.params.id_pelicula + "' en la base de datos." });
    } else {
      res.send(rows);
    }
  });
});

router.post('/validar-cliente', urlencodedParser, function (req, res) {

  if (!req.body) return res.sendStatus(400);

  console.log("mail: "+req.body.email_login+" - pass: "+req.body.password_login);

  con.query('SELECT Cliente.* FROM Cliente WHERE Cliente.email = "'+req.body.email_login+'" AND Cliente.password = MD5("'+req.body.password_login+'")', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.sendStatus(401);
    } else {
      res.sendStatus(200);
    }
  });
});

module.exports = router;
