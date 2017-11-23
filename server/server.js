const express = require('express');
const port = process.env.PORT||3000;
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const hbs = require('hbs');
const fileUpload = require('express-fileupload');
var fileUploadPath = require('path');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session')({
  secret: "secret",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: Date.now() + 3600
  }
});
const expressSocketSession = require('express-socket.io-session');


const publicPath = path.join(__dirname, '/../views');
const publicImagePath = path.join(__dirname, '/../canvasDirectory');
const partialsPath = path.join(__dirname, '/../views/partials');


var app = express();
var server = http.createServer(app);
var io = socketIO(server);
app.set('view engine', 'hbs');
hbs.registerPartials(partialsPath);
hbs.registerHelper('if_eq', function (a, b, options) {
  if(a == b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

app.use(express.static(publicPath));
app.use(express.static(publicImagePath));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '16mb'
}));
app.use(bodyParser.json({
  limit: '16mb'
}));
app.use(fileUpload());
app.use(expressSession);
io.use(expressSocketSession(expressSession, {
  autoSave: true
}));
io.on('connection', function(socket) {

  if(socket.handshake.session.username) {
    socket.join(socket.handshake.session.username+'_self');
    socket.join(socket.handshake.session.username+'_others');
  }
  socket.on('disconnect', function () {
    socket.leave(socket.handshake.session.username+'_self');
    socket.leave(socket.handshake.session.username+'_others');
  });

});
const routes = require('./routes/routes')(io);
app.use(routes);

server.listen(port, function () {
  console.log(`server is up on ${port}`);
});
