var express = require('express');

var app = express();
app.use(express.static('/client'));

function serveIndex(req, res) {
	res.redirect(".client/gol.html");
}

app.get('/', serveIndex).listen(8080);