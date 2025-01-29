let AtackPlayer 
let AtackRival
let vidaPlayer =3
let vidaRival = 3

function inciarjuegoPuchamon() {
  let botonPuchamonPlayer = document.getElementById("BotonPuchamon");
  botonPuchamonPlayer.addEventListener("click", SeleccionarPuchamonPlayer);

let botonfuego = document.getElementById("Ataque_fuego");
botonfuego.addEventListener("click", ataquefuego)
let botonplanta = document.getElementById("Ataque_planta");
botonplanta.addEventListener("click", ataqueplanta)
let botonagua = document.getElementById("Ataque_agua");
botonagua.addEventListener("click", ataqueagua)

}

function SeleccionarPuchamonPlayer() {
  let inputCharmander = document.getElementById("Charmander");
  let inputBulbasaur = document.getElementById("Bulbasaur");
  let inputSquirtle = document.getElementById("Squirtle");
  let SpamMascotaJugador = document.getElementById("mascota-jugador");

  if (inputCharmander.checked) {
    SpamMascotaJugador.innerHTML = "Charmander";
  } else if (inputBulbasaur.checked) {
    SpamMascotaJugador.innerHTML = "Bulbasaur";
  } else if (inputSquirtle.checked) {
    SpamMascotaJugador.innerHTML = "Squirtle";
  } else {
    alert("No has seleccionado ningún Puchamon");
  }
  seleccionarPuchamonRival();
}

function seleccionarPuchamonRival() {
  let mascotaAleatorio = aleatorio(1, 3);
  let SpamMascotaRival = document.getElementById("mascota-enemigo");

  if (mascotaAleatorio == 1) {
    SpamMascotaRival.innerHTML = "Charmander";
  } else if (mascotaAleatorio == 2) {
    SpamMascotaRival.innerHTML = "Bulbasaur";
  } else if (mascotaAleatorio == 3) {
    SpamMascotaRival.innerHTML = "Squirtle";
  } else {
    alert("No has seleccionado ningún Puchamon");
  }
}

function ataquefuego(){
    AtackPlayer = "Fuego"
    AtackRandomEnemigo()
}
 function ataqueplanta(){
    AtackPlayer = "Planta"
    AtackRandomEnemigo()

}
function ataqueagua(){
    AtackPlayer = "Agua"
    AtackRandomEnemigo()
}

function AtackRandomEnemigo(){
    let ataqueAleatorio = aleatorio(1,3)

    if (ataqueAleatorio == 1) {
        AtackRival = "Fuego"
    } else if (ataqueAleatorio == 2) {
        AtackRival = "Planta"
    } else {
        AtackRival = "Agua"
    }
    batalla()
}

function batalla(){
    let SpamvidaJugador = document.getElementById("VidaPlayer")
    let SpamvidaRival = document.getElementById("VidaRival")
    if (AtackRival == AtackPlayer) {
        mensaje(" EMPATE ");
    } else if (AtackPlayer == 'Fuego' && AtackRival == 'Planta') {
        mensaje(" GANASTE ");
        vidaRival--
        SpamvidaRival.innerHTML = vidaRival
    } else if (AtackPlayer == 'Agua' && AtackRival == 'Fuego') {
        mensaje(" GANASTE ");
        vidaRival--
        SpamvidaRival.innerHTML = vidaRival
    } else if (AtackPlayer == 'Planta' && AtackRival == 'Agua') {
        mensaje(" GANASTE ");
        vidaRival--
        SpamvidaRival.innerHTML = vidaRival
    } else {
        mensaje(" PERDISTE ");
        vidaPlayer--
        SpamvidaJugador.innerHTML = vidaPlayer
    }

}
function mensaje(resultado){
    let sectionResultado = document.getElementById("Mensaje_Resultado")

    let SpamResultado = document.createElement("p")
    SpamResultado.innerHTML = "Tu mascota uso el ataque " + AtackPlayer + " y tu enemigo contraataca con " + AtackRival + resultado

    sectionResultado.appendChild(SpamResultado)
}

function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

window.addEventListener("load", inciarjuegoPuchamon);
