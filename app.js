var express = require('express');
var routes = require('./routes');
var admin_routes = require('./admin');

var app = express();

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

//cargar rutas
app.use('/', routes);
app.use('/admin', admin_routes);

//ejecucion del server
app.listen(port, ipaddress, function () {
	console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), ipaddress, port);
});
