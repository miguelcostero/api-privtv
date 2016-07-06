var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var _ = require('underscore');
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

//configuraciones
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

//configuramos methodOverride
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

//ruta para hacer login
app.post('/login/', function (req, res) {
  //peticion
  if (!req.body) return  res.status(400).json({"msg":"Error"})

  con.query("SELECT Cliente.*, Empleado.* FROM Cliente INNER JOIN Empleado ON Cliente.idCliente = Empleado.Cliente_idCliente WHERE Cliente.email = '" + req.body.datos.email + "' AND Cliente.password = md5('" + req.body.datos.password + "')", function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(204).json({"msg":"No se ha encontrado su búsqueda"})
    }
  })
})

app.put('/peliculas/:id_pelicula', function (req, res) {
  //peticion
  if (!req.body) return  res.status(400).json({"msg":"Error"})

  con.query("UPDATE Pelicula SET nombre='" + req.body.datos.nombre + "', sipnosis='"+ req.body.datos.sipnosis +"',idioma='" +req.body.datos.idioma+ "',ano_publicacion='" +req.body.datos.ano_publicacion+ "',duracion='" +req.body.datos.duracion+ "',clasificacion='" +req.body.datos.clasificacion+ "',formato='" +req.body.datos.formato+ "',poster= '" +req.body.datos.poster+ "', movie_source='" +req.body.datos.movie_source+ "',trailer_source='" +req.body.datos.trailer_source+ "',fecha_hora_publicacion='" +req.body.datos.fecha_hora_publicacion+ "' WHERE idPelicula= '"+ req.body.datos.idPelicula +"'", function (err, rows) {
    if(err) throw err;

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json({"msg": "No se ha podido completar la actualización"})
    }
  })
})

app.delete('/peliculas/:id_pelicula', function (req, res) {
  //peticion
  if (!req.body) return  res.status(400).json({"msg":"Error"})

  con.query("DELETE FROM Pelicula WHERE idPelicula = '"+ req.params.id_pelicula +"'", function (err, rows) {
    if(err) throw err;

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json({"msg": "No se ha podido eliminar la pelicula"})
    }
  })
})

app.put('/clientes/basicos/:id_cliente', function (req, res) {
  if (!req.body) return res.status(400).json({"msg":"Error"})

  con.query("UPDATE Cliente SET Cliente.email = '"+req.body.datos.email+"',Cliente.nombre = '"+req.body.datos.nombre+"',Cliente.apellido = '"+req.body.datos.apellido+"',Cliente.fecha_nacimiento = '"+req.body.datos.fecha_nacimiento+"',Cliente.telefono = '"+req.body.datos.telefono+"',Cliente.direccion = '"+req.body.datos.direccion+"' WHERE Cliente.idCliente = '"+req.params.id_cliente+"' ", function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json({"msg": "No se ha podido completar la peticion"})
    }
  })
})

app.put('/clientes/password/:id_cliente', function (req, res) {
  if (!req.body) return res.status(400).json({"msg":"Error"})

  con.query("UPDATE Cliente SET Cliente.password = '"+req.body.password+"' WHERE Cliente.idCliente = '"+req.params.id_cliente+"'", function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json("msg": "No se ha podido completar la actualización.")
    }
  })
})

module.exports = app;
