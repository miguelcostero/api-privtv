var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();
//conexion a mysql
var con = mysql.createConnection({
  host: process.env.OPENSHIFT_MYSQL_DB_HOST,
  user: process.env.OPENSHIFT_MYSQL_DB_USERNAME,
  password: process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
  database: process.env.OPENSHIFT_APP_NAME
});

//IP  y puerto de la app
var ipaddress, port;
ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.OPENSHIFT_INTERNAL_IP;
port      = process.env.OPENSHIFT_NODEJS_PORT || process.env.OPENSHIFT_INTERNAL_PORT || 8080;

if (typeof ipaddress === "undefined") {
    //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
    //  allows us to run/test the app locally.
    console.warn('No OPENSHIFT_*_IP var, using 127.0.0.1');
    ipaddress = "127.0.0.1";
};

//Archivos estaticos
app.use('/public', express.static('public'));

//utilizacion del body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//rutas
app.get('/empleados', function (req, res) {
  con.query('SELECT * FROM Empleado', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

app.get('/peliculas', function (req, res) {
  con.query('SELECT * FROM Pelicula', function(err, rows) {
    if(err) throw err;

    res.setHeader('Content-Type', 'application/json');
    res.send(rows);
  });
});

app.post('/users', function (req, res) {
	console.log("Email: "+req.body.email);
	console.log("Contraseña: "+req.body.pass);
	res.send('Hemos recibido tus datos.');
});

//ejecucion del server
app.listen(port, ipaddress, function () {
	console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), ipaddress, port);
});
