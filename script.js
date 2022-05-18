//VARIABLES
var latitud;
var longitud;
var limites = [];
var limitesMark;
var map;
var pos;
var posMarker;
var tesoro;
var tesoroMark;
var distancia;
var vibracion = 0;
var frecuencia = 1500;
var intervalo;
var watch;
var juegoIniciado = false;

/**
 * Calcula por primera vez la posición del jugador
 * @param {*} position posición del jugador
 */
function procesarPosicion(position) {
    actualizarPosicion(position);
    map.panTo(pos);
}

/**
 * Inicia el juego, y oculta el botón
 */
function iniciar(){
    if (navigator.geolocation) {
       watch = navigator.geolocation.watchPosition(actualizarPosicion, fallo);
        map.panTo(pos);
        juegoIniciado = true;
        calcularLimites();
        document.getElementById('iniciar').style.display = "none";
    }
    else
        window.alert("Tu navegador no permite la geolocalización.");
}

/** 
 * Finaliza el juego y oculta el botón de reclamar botón 
*/
function reclamar(){
    document.getElementById('reclamar').style.display = "none";
    document.getElementById('iniciar').style.display = "flex";
    resetearJuego();
}

function resetearJuego(){
    latitud = undefined;
    longitud = undefined;
    limites = [];
    tesoro = undefined;
    distancia = undefined ;
    vibracion = 50;
    frecuencia = 3000;
    juegoIniciado = false;
    clearInterval(intervalo);
    navigator.geolocation.clearWatch(watch);
    posMarker.setMap(null);
    limitesMark.setMap(null);
    tesoroMark.setMap(null);
    document.getElementById("vibracion").innerHTML = `Vibración:`;
    document.getElementById("frecuencia").innerHTML = `Frecuencia:`;
    document.getElementById("distancia").innerHTML = `Distancia:`;

}

/**
 * Actualiza la posición del jugador
 * @param {*} position posición del jugador
 */
function actualizarPosicion(position){
    latitud=position.coords.latitude;
    longitud=position.coords.longitude;
    pos =  new google.maps.LatLng(latitud,longitud);
    if(posMarker)
        posMarker.setMap(null);
    posMarker = new google.maps.Marker({
        position: pos,
        map: map,
      });

    console.log(`LATITUD: ${latitud}, LONGITUD: ${longitud}`);
    if(juegoIniciado)
        calcularDistancia();
}

/**
 * Devuelve un fallo en caso de que el navegador no sea capaz de localizar al usuario
 */
function fallo() {
    window.alert("No es posible geolocalizarte. Comprueba que tienes activada esa posibilidad.");
}

/**
 * Inicializa el mapa a mostrar en el navegador 
 */
function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(procesarPosicion, fallo);
    }
    else
        window.alert("Tu navegador no permite la geolocalización.");
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 18,
      center: pos
    });
}

/**
 * Calcula los limites del terreno de juego y llama a las funciones que muestran el mismo y generan el tesoro.
 */
function calcularLimites(){
    limites = new google.maps.LatLngBounds(
        new google.maps.LatLng(
            google.maps.geometry.spherical.computeOffset(pos, 125*0.3048, 180).lat(), 
            google.maps.geometry.spherical.computeOffset(pos, 125*0.3048, 270).lng()),
        new google.maps.LatLng(
            google.maps.geometry.spherical.computeOffset(pos, 125*0.3048, 0).lat(),
            google.maps.geometry.spherical.computeOffset(pos, 125*0.3048, 90).lng()));

    generarTesoro();
    generarArea();
}

/**
 * Genera el tesoro en una ubicación aleatoria dentro de los límites establecidos dentro del terreno de juego.
 */
function generarTesoro(){
    const lngSpan =limites.getNorthEast().lng() - limites.getSouthWest().lng();
    const latSpan = limites.getNorthEast().lat() - limites.getSouthWest().lat();
    tesoro =  new google.maps.LatLng(
        limites.getSouthWest().lat() + latSpan * Math.random(),
        limites.getSouthWest().lng() + lngSpan * Math.random(),
    )
    console.log(`LATITUD TESORO: ${tesoro.lat()}, LONGITUD: ${tesoro.lng()}`);
    tesoroMark = new google.maps.Marker({
        position: tesoro,
        map: map,
      });
}

/**
 * Genera el rectangulo que delimita el terreno de juego
 */
function generarArea(){   
    limitesMark = new google.maps.Rectangle({
      map: map,
      bounds: limites
      });
}

function calcularDistancia(){
    var distanciaB;
    if(tesoro){
        distanciaB = google.maps.geometry.spherical.computeDistanceBetween(pos, tesoro);
        console.log("DISTANCIA: ", distancia);
    }

    if(distanciaB < distancia){
        
        vibracion += 50;
        if(frecuencia > 100)
            frecuencia -= 50;
        document.getElementById("vibracion").innerHTML = `Vibración: ${vibracion}`;
        document.getElementById("frecuencia").innerHTML = `Frecuencia: ${frecuencia}`;

    }
    else if(distanciaB > distancia){
        if(vibracion > 50)
            vibracion -= 50;

        frecuencia += 50;
        document.getElementById("vibracion").innerHTML = `Vibración: ${vibracion}`;
        document.getElementById("frecuencia").innerHTML = `Frecuencia: ${frecuencia}`;
    }
    
    distancia = distanciaB;
    document.getElementById("distancia").innerHTML = `Distancia: ${distancia}`;

    if(distancia < 5) document.getElementById('reclamar').style.display = "flex";
    console.log(`VIBRO: ${vibracion}, SONIDO: ${frecuencia}`);

    window.navigator.vibrate([200, 50]);
    sonido();
}

function sonido(){
    clearInterval(intervalo);
    var audio = new Audio('./beep.wav');
    
    intervalo = setInterval(() => {
        audio.play();
    }, frecuencia)
}