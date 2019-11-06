/*  EXPRESS & HTTP SETUP  */

const express = require('express');
const path = require('path');
const app = express();
const serveur = require('http').Server(app);

const bodyParser = require('body-parser');

//récupérer les fichiers html sans utiliser les extensions 
app.use(express.static(__dirname + '/', {
    extensions: ['html']
}));
//body-parser est un middleware express qui lit les entrées d'un formulaire et les stockent sous la forme d'un objet javascript accessible via req.body
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => res.sendFile('index.html', {
    root: __dirname
}));

const port = process.env.NODE_PORT || 2424;
serveur.listen(port, () => console.log('Serveur en écoute sur le port ' + port));

var traj1 = require('./traj1.json');
var traj2 = require('./traj2.json');
var traj3 = require('./traj3.json');
var traj4 = require('./traj4.json');
var traj5 = require('./traj5.json');

/* SOCKET.IO */
var io = require('socket.io')(serveur);

io.sockets.on('connection', (socket) => {

    // envoie des valeurs du fichier traj1.json au lancement de la page
    socket.emit('jsonfile', traj1);

    // écoute le choix du trajet choisit par le client avant de renvoyer les valeurs du fichier json correspondant
    socket.on('trajet', (message) => {
        switch (message) {
            case "trajet1":
                socket.emit('jsonfile', traj1);
                break;
            case "trajet2":
                socket.emit('jsonfile', traj2);
                break;
            case "trajet3":
                socket.emit('jsonfile', traj3);
                break;
            case "trajet4":
                socket.emit('jsonfile', traj4);
                break;
            case "trajet5":
                socket.emit('jsonfile', traj5);
                break;
            default:
                break;
        }
    })
});