// APPELER LE MODULE HTTP
const http = require('http');
const app = require('./app');


/********* Renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne *********/
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

/********* Obtention du port de l'environnement et le stocker dans Express. *********/
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);


/********* Écoute d'événement : pour l'événement "erreur" du serveur HTTP *********/
//errorHandler : recherche les différentes erreurs et les gère de manière appropriée
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/********* Fabrication du server HTTP *********/
const server = http.createServer(app);


/********* Écoute d'événement : pour le server HTTP *********/
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);
