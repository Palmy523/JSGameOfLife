var express = require('express');
var path = require('path');

var app = express();
app.set('port', 8080);
console.log("Serving static path: " + path.join(__dirname, 'client'));
app.use(express.static(path.join(__dirname, 'client')));

/**
 * Serve the home page if running a node js server.
 */
function serveIndex(req, res) {
	res.redirect("gol.html");
}

function start() {
	console.log("Started Server on port " + app.get('port'));
}
// Listen for requests
var server = app.listen(app.get('port'), start);

app.get('/', serveIndex);
