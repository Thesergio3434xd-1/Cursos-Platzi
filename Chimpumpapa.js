let victoriasJugador = 0;
let victoriasPC = 0;

function obtenerEleccionJugador() {
  let jugador = prompt("Elige una opción: 1. Piedra, 2. Papel, 3. Tijeras");
  if (jugador == 1) {
    alert("El jugador elige ✊");
  } else if (jugador == 2) {
    alert("El jugador elige ✋");
  } else if (jugador == 3) {
    alert("El jugador elige ✌️");
  } else {
    alert("Opción no válida");
    return obtenerEleccionJugador();
  }
  return jugador;
}

function obtenerEleccionPC() {
  let min = 1;
  let max = 3;
  let pc = Math.floor(Math.random() * (max - min + 1) + min);
  if (pc == 1) {
    alert("La 🤖 elige ✊");
  } else if (pc == 2) {
    alert("La 🤖 elige ✋");
  } else if (pc == 3) {
    alert("La 🤖 elige ✌️");
  }
  return pc;
}

function determinarGanador(jugador, pc) {
  if (jugador == pc) {
    alert("Es un empate");
  } else if (
    (jugador == 1 && pc == 3) ||
    (jugador == 2 && pc == 1) ||
    (jugador == 3 && pc == 2)
  ) {
    alert("¡El jugador gana!");
    victoriasJugador++;
  } else {
    alert("La 🤖 gana");
    victoriasPC++;
  }
}

function jugar() {
  while (victoriasJugador < 3 && victoriasPC < 3) {
    let jugador = obtenerEleccionJugador();
    let pc = obtenerEleccionPC();
    determinarGanador(jugador, pc);
    alert(`Marcador: Jugador ${victoriasJugador} - 🤖 ${victoriasPC}`);
  }

  if (victoriasJugador == 3) {
    alert("¡El jugador gana la serie!");
  } else {
    alert("La 🤖 gana la serie");
  }

  if (confirm("¿Quieres volver a jugar?")) {
    location.reload();
  }
}

jugar();
