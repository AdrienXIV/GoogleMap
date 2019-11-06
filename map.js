   // écoute du serveur
   var socket = io.connect('http://localhost:2424');

   // récupération des valeurs de la liste 
   var trajet = document.getElementById('menu-deroulant');
   trajet.onchange = () => {
       let selectvalue = trajet.options[trajet.selectedIndex].value;

       // envoie de la valeur de la liste selectionnée au serveur
       socket.emit("trajet", selectvalue);
   }

   var map; // variable de l'api google map
   var waypts = []; // tableau des points intermédiaires
   var taille = 0; // taille du fichier json
   
   var pos_center = { // position de la vue centré sur google map
       lat: 0,
       lng: 0
   }; 

   var pos_origin = { // adresse d'origine
       lat: 0,
       lng: 0
   }; 

   var pos_destination = { // adresse de fin
       lat: 0,
       lng: 0
   }; 

   var polylines = []; // différents tracés de couleurs
   var colors = ["black", "red", "yellow", "#2980b9", "#3498db"]; // couleurs disponibles
   var tab = []; // tableau récupérant les valeurs du fichier json envoyé depuis le serveur


   // écoute d'un message provenant du serveur
   socket.on('jsonfile', function (message) {

       // recherche 1 à 1 tous les éléments du fichier pour les stocker dans un tableau
       message.forEach(element => {
           tab.push(element)

           // stockage de toutes les coordonnées
           waypts.push({
               location: {
                   lat: element.lat,
                   lng: element.lng
               },
               stopover: true
           });
           taille = message.length - 1; // taille - 1 pour avoir la valeur en comptant à partir de 0 afin de naviguer dans un tableau
       });
       
       pos_center = { // coordonnées de la vue de la carte
           lat: message[0].lat,
           lng: message[0].lng
       }; 
       pos_origin = pos_center; // coordonnées de départ

       pos_destination = { // coordonnées d'arrivées
           lat: message[taille].lat,
           lng: message[taille].lng
       }; 

       initMap(); // initialisation de l'api
   })

   function initMap() {
       var infowindow = new google.maps.InfoWindow(); // instance des infos 
       var directionsService = new google.maps.DirectionsService(); // instance pour les trajets
       var directionsDisplay = new google.maps.DirectionsRenderer({ // ajout des options dans les trajets
           suppressPolylines: true,
           infoWindow: infowindow
       });

       map = new google.maps.Map(document.getElementById('map'), { // initialisation de la carte
           zoom: 6,
           center: pos_center
       });
       directionsDisplay.setMap(map);
       calculateAndDisplayRoute(directionsService, directionsDisplay); // initialisation des points intermédiaires
   }

   function calculateAndDisplayRoute(directionsService, directionsDisplay) {

       directionsService.route({
           origin: pos_origin, // départ
           destination: pos_destination, // destination
           waypoints: waypts, // points intermédiaires
           optimizeWaypoints: true,
           travelMode: "DRIVING"
       }, function (response, status) {
           if (status === google.maps.DirectionsStatus.OK) {
               directionsDisplay.setOptions({
                   directions: response,
               })
               var route = response.routes[0];
               renderDirectionsPolylines(response, map, tab); // passage du tableau de coordonnées pour la couleur en fonction du paramètre de confiance
           } else {
               window.alert('Directions request failed due to ' + status);
           }
       });

   }

   // couleur par défaut
   var polylineOptions = {
       strokeColor: '#2980b9',
       strokeOpacity: 1,
       strokeWeight: 4
   };

   function renderDirectionsPolylines(response, map, tab) {
       for (var i = 0; i < polylines.length; i++) {
           polylines[i].setMap(null);
       }
       var legs = response.routes[0].legs;
       for (i = 0; i < legs.length; i++) {
           var steps = legs[i].steps;
           for (j = 0; j < steps.length; j++) {
               var nextSegment = steps[j].path;
               var stepPolyline = new google.maps.Polyline(polylineOptions);
               // conditions en fonction de l'indice de confiance une couleur est attribuée entre 2 points
               if (tab[i].confiance < 50) {
                   stepPolyline.setOptions({
                       strokeColor: colors[0] // noir
                   })
               } else if (tab[i].confiance >= 50 && tab[i].confiance < 55) {
                   stepPolyline.setOptions({
                       strokeColor: colors[1] // rouge
                   })
               } else if (tab[i].confiance >= 55 && tab[i].confiance < 70) {
                   stepPolyline.setOptions({
                       strokeColor: colors[2] // orange
                   })
               } else {
                   stepPolyline.setOptions({
                       strokeColor: colors[3] // bleu
                   })
               }

               for (k = 0; k < nextSegment.length; k++) {
                   stepPolyline.getPath().push(nextSegment[k]);
               }
               polylines.push(stepPolyline);
               stepPolyline.setMap(map);
           }
       }
   }