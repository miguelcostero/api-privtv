var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./js/routes');

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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//cargar rutas
app.use('/', routes);

//ejecucion del server
app.listen(port, ipaddress, function () {
	console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), ipaddress, port);
});
