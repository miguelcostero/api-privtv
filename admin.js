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
  if (!req.body) return  res.status(500).json({"msg":"Error"})
/*
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With")
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
*/
  con.query("SELECT Cliente.*, Empleado.* FROM Cliente INNER JOIN Empleado ON Cliente.idCliente = Empleado.Cliente_idCliente WHERE Cliente.email = '" + req.body.datos.email + "' AND Cliente.password = md5('" + req.body.datos.password + "')", function (err, rows) {
    if (err) throw err

    if (!_.isEmpty(rows)) {
      res.status(200).json(rows)
    } else {
      res.status(500).json({"msg":"No se ha encontrado su búsqueda"})
    }
  })
});


module.exports = app;
