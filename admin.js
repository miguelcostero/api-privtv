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
app.use(bodyParser.json({limit: '10mb'}));

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

app.patch('/clientes/:id_cliente/password', function (req, res) {
  if (!req.body) return res.status(400).json({"msg":"Error"})

  con.query("UPDATE Cliente SET Cliente.password = '"+req.body.password+"' WHERE Cliente.idCliente = '"+req.params.id_cliente+"'", function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json({"msg": "No se ha podido completar la peticion"})
    }
  })
})

app.get('/clientes/:id_cliente/suscripcion', function (req, res) {
  if (!req.body) return res.status(400).json({"msg":"Error"})

  con.query("SELECT tipo_suscripcion.* FROM tipo_suscripcion INNER JOIN Cliente ON tipo_suscripcion.id_tipo_suscripcion = Cliente.tipo_suscripcion_id_tipo_suscripcion WHERE Cliente.idCliente = '"+req.params.id_cliente+"'", function (err, rows) {
    if(err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json({"msg":"No se ha podido completar la petición."})
    }
  })
})

app.patch('/clientes/:id_cliente/suscripcion/:id_suscripcion', function (req, res) {
  if (!req.body) return res.status(400).json({"msg":"Error"})

  con.query("UPDATE Cliente SET Cliente.tipo_suscripcion_id_tipo_suscripcion = '"+req.params.id_suscripcion+"' WHERE Cliente.idCliente = '"+req.params.id_cliente+"'", function (err, rows) {
    if(err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json({"msg":"No se ha podido completar la petición."})
    }
  })
})

app.get('/planes', function (req, res) {
  if (!req.body) return res.status(400).json({"msg":"Error"})

  con.query("SELECT tipo_suscripcion.* FROM tipo_suscripcion", function (err, rows) {
    if(err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(400).json({"msg":"No se ha podido completar la petición."})
    }
  })
})

app.get('/clientes/:email', function (req, res) {
  con.query("SELECT Cliente.* FROM Cliente WHERE Cliente.email = '"+req.params.email+"'", function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).send("true")
    } else {
      res.status(200).send("false")
    }
  })
})

app.get('/usuarios/:id_usuario/clientes/:id_cliente', function (req, res) {
  con.query('SELECT Usuario.* FROM Cliente INNER JOIN Usuario ON Cliente.idCliente = Usuario.Cliente_idCliente WHERE Cliente.idCliente = "' + req.params.id_cliente + '" AND Usuario.idUsuario = "'+req.params.id_usuario+'"', function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).send(rows)
    } else {
      res.status(400).json({"msg":"error"})
    }
  })
})

app.get('/usuarios/clientes/:id_cliente', function (req, res) {
  con.query('SELECT Usuario.* FROM Cliente INNER JOIN Usuario ON Cliente.idCliente = Usuario.Cliente_idCliente WHERE Cliente.idCliente = "' + req.params.id_cliente + '"', function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).send(rows)
    } else {
      res.status(400).json({"msg":"error"})
    }
  })
})

app.get('/usuarios/:id_usuario/clientes/', function (req, res) {
  con.query('SELECT Usuario.* FROM Cliente INNER JOIN Usuario ON Cliente.idCliente = Usuario.Cliente_idCliente WHERE Usuario.idUsuario = "'+req.params.id_usuario+'"', function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).send(rows)
    } else {
      res.status(400).json({"msg":"error"})
    }
  })
})

app.delete('/usuarios/:id_usuario/clientes/:id_cliente', function (req, res) {
  con.query('DELETE FROM Usuario WHERE Usuario.idUsuario = "'+req.params.id_usuario+'"', function (err, result) {
    if (err) throw err

    if (!_.isEmpty(result)) {
      con.query('SELECT Usuario.* FROM Cliente INNER JOIN Usuario ON Cliente.idCliente = Usuario.Cliente_idCliente WHERE Cliente.idCliente = "' + req.params.id_cliente + '"', function (err, rows) {
        if (err) throw err

        if (!_.isEmpty(rows)) {
          res.status(200).send(rows)
        } else {
          res.status(400).json({"msg":"error"})
        }
      })
    } else {
      res.status(400).json({"msg":"error"})
    }
  })
})

app.post('/usuarios/clientes/:id_cliente', function (req, res) {
  if (!req.body) res.status(400).json({"msg":"Error"})

  con.query('INSERT INTO Usuario(idUsuario, nickname, biografia, imagen_perfil, Cliente_idCliente, admin) VALUES (DEFAULT, "'+req.body.registro.nickname+'","'+req.body.registro.biografia+'","'+req.body.registro.imagen_perfil+'","'+req.params.id_cliente+'","false")', function (err, result) {
    if (err) throw err

    if (!_.isEmpty(result)) {
      let id_usuario = result.insertId;
      con.query("SELECT Usuario.* FROM Usuario WHERE Usuario.idUsuario = '"+id_usuario+"'", function (err, row) {
        if (err) throw err
        res.status(200).json(row)
      })
    } else {
      res.status(400).json({"msg":"error"})
    }
  })
})

module.exports = app;
