var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var s_ = require("underscore.string");
var mysql = require('mysql');
var cors = require('cors');
var app = express();

//conexion a mysql
var host_mysql, user_mysql, password_mysql, database_mysql;

host_mysql = process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost';
user_mysql = process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root';
password_mysql = process.env.OPENSHIFT_MYSQL_DB_PASSWORD || '';
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

app.use(cors());

// middleware that is specific to this app
app.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// define the home page route
app.get('/', function(req, res) {
  res.send('API home page');
});

//rutas de las peliculas
app.get('/peliculas', function (req, res) {
  con.query('SELECT Pelicula.*, contaRepro(Pelicula.idPelicula) AS numReproducciones, GROUP_CONCAT(Genero.nombre) AS Generos FROM Pelicula INNER JOIN Genero_Pelicula ON Pelicula.idPelicula = Genero_Pelicula.Pelicula_idPelicula INNER JOIN Genero ON Genero_Pelicula.Genero_idGenero = Genero.idGenero GROUP BY Pelicula.idPelicula', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

app.get('/peliculas/:id_pelicula', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  con.query('SELECT Pelicula.*, contaRepro(Pelicula.idPelicula) AS numReproducciones, GROUP_CONCAT(Genero.nombre) AS Generos FROM Pelicula INNER JOIN Genero_Pelicula ON Pelicula.idPelicula = Genero_Pelicula.Pelicula_idPelicula INNER JOIN Genero ON Genero_Pelicula.Genero_idGenero = Genero.idGenero WHERE Pelicula.idPelicula = " ' + req.params.id_pelicula + ' "', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.send({ "mensaje": "No existe el id '" + req.params.id_pelicula + "' en la base de datos." });
    } else {
      res.send(rows);
    }
  });
});

app.get("/generos", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  con.query('SELECT Genero.* FROM Genero', function (err, rows) {
    if (err) throw err;

    if (_.isEmpty(rows)) {
      res.send({ "mensaje": "No hay generos en la base de datos" });
    } else {
      res.send(rows);
    }
  })
})

app.get("/generos/:id_genero", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  con.query('SELECT Pelicula.*, Genero.* FROM Genero INNER JOIN Genero_Pelicula ON Genero.idGenero = Genero_Pelicula.Genero_idGenero INNER JOIN Pelicula ON Genero_Pelicula.Pelicula_idPelicula = Pelicula.idPelicula WHERE Genero.idGenero = " '+ req.params.id_genero +' "', function (err, rows) {
    if (err) throw err;

    if (_.isEmpty(rows)) {
      res.send({ "mensaje": "No hay pelicula con ese genero en la base de datos" });
    } else {
      res.send(rows);
    }
  })
})

app.get('/pelicula-generos/:id_pelicula', function (req, res) {
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

app.get('/pelicula-actores/:id_pelicula', function (req, res) {
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

app.get('/pelicula-directores/:id_pelicula', function (req, res) {
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

app.post('/validar-cliente', urlencodedParser, function (req, res) {

  if (!req.body) return res.sendStatus(400);
  var cliente = "";

  console.log("mail: "+req.body.email_login+" - pass: "+req.body.password_login);

  con.query('SELECT Cliente.* FROM Cliente WHERE Cliente.email = "'+req.body.email_login+'" AND Cliente.password = MD5("'+req.body.password_login+'")', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.sendStatus(401);
    } else {
      cliente = rows;
      con.query('SELECT Empleado.* FROM Empleado INNER JOIN Cliente ON Empleado.Cliente_idCliente = Cliente.idCliente WHERE Cliente.idCliente = " ' + cliente[0].idCliente + ' "', function (error, row) {
        if(error) throw error;

        if (_.isEmpty(row)) {
          res.send(cliente);
        } else {
          cliente[0].empleado_info = row;
          res.send(cliente);
        }
      })
    }
  });
});

app.get('/users/cliente/:id_cliente', function (req, res) {

  con.query('SELECT Usuario.* FROM Cliente INNER JOIN Usuario ON Cliente.idCliente = Usuario.Cliente_idCliente WHERE Cliente.idCliente = "' + req.params.id_cliente + '"', function(err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.sendStatus(404);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(rows);
    }
  });
});

app.get('/users/:id_usuario', function (req, res) {
  con.query('SELECT Usuario.* FROM Usuario WHERE Usuario.idUsuario = "' + req.params.id_usuario + '"', function (err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.sendStatus(404);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(rows);
    }
  });
});

app.get('/peliculas/:id_pelicula/subtitulos', function (req, res) {
  con.query('SELECT Subtitulo.* FROM Pelicula INNER JOIN Subtitulo ON Pelicula.idPelicula = Subtitulo.Pelicula_idPelicula WHERE Pelicula.idPelicula = "' + req.params.id_pelicula + '"', function (err, rows) {
    if(err) throw err;

    if (_.isEmpty(rows)) {
      res.sendStatus(404);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(rows);
    }
  });
})

app.get('/empleado', function (req, res) {
  con.query('SELECT Empleado.idEmpleado, Empleado.rango, Cliente.* FROM Empleado INNER JOIN Cliente ON Empleado.Cliente_idCliente = Cliente.idCliente', function (err, rows) {
    if (err) throw err;

    if (_.isEmpty(rows)) {
      res.sendStatus(404);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(rows);
    }
  })
})

app.get('/empleado/:id_empleado', function (req, res) {
  con.query('SELECT Empleado.idEmpleado, Empleado.rango, Cliente.* FROM Empleado INNER JOIN Cliente ON Empleado.Cliente_idCliente = Cliente.idCliente WHERE Empleado.idEmpleado = "'+ req.params.id_empleado +'"', function (err, rows) {
    if (err) throw err;

    if (_.isEmpty(rows)) {
      res.sendStatus(404);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(rows);
    }
  })
})

app.post('/peliculas/reproduccion/:id_pelicula', jsonParser, urlencodedParser, function (req, res) {
  //peticion
  if (!req.body) return  res.status(400).json({"msg":"Error"})

  con.query("INSERT INTO Historial (idHistorial, fecha_hora_reproduccion, Pelicula_idPelicula, Usuario_idUsuario, Usuario_Cliente_idCliente) VALUES (DEFAULT , NOW(), '"+ req.params.id_pelicula +"', '"+ req.body.datos.id_usuario +"', '"+ req.body.datos.id_cliente +"')", function (err, rows) {
    if(err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json({"msg": "No se ha podido agregar la reproduccion"})
    }
  })
})

module.exports = app;
