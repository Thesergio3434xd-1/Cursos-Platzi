// Estado del juego y WebSocket
let ws = null;
const ESTADO_JUEGO = {
  jugador: {
    id: null,
    puchamon: null,
    vida: 100,
    ataques: []
  },
  rival: {
    puchamon: null,
    vida: 100,
    ataques: []
  },
  salaId: null,
  turnoActual: null
};

// Configuración de tipos y efectividad
const TIPOS = {
  FUEGO: 'Fuego',
  AGUA: 'Agua',
  PLANTA: 'Planta'
};

const EFECTIVIDAD = {
  [TIPOS.FUEGO]: { fuerte: TIPOS.PLANTA, debil: TIPOS.AGUA },
  [TIPOS.AGUA]: { fuerte: TIPOS.FUEGO, debil: TIPOS.PLANTA },
  [TIPOS.PLANTA]: { fuerte: TIPOS.AGUA, debil: TIPOS.FUEGO }
};

const PUCHAMONES = {
  Charmander: { nombre: 'Charmander', tipo: TIPOS.FUEGO },
  Squirtle: { nombre: 'Squirtle', tipo: TIPOS.AGUA },
  Bulbasaur: { nombre: 'Bulbasaur', tipo: TIPOS.PLANTA }
};

// Elementos del DOM
const elementos = {
  secciones: {
    multiplayer: document.getElementById('multiplayer-section'),
    seleccion: document.getElementById('Select_PuchaMon'),
    ataque: document.getElementById('Select_atack')
  },
  botones: {
    crearSala: document.getElementById('crear-sala'),
    unirseSala: document.getElementById('unirse-sala'),
    seleccionar: document.getElementById('BotonPuchamon'),
    fuego: document.getElementById('Ataque_fuego'),
    agua: document.getElementById('Ataque_agua'),
    planta: document.getElementById('Ataque_planta'),
    modalReiniciar: document.getElementById('modal-boton')
  },
  displays: {
    codigoSala: document.getElementById('codigo-sala'),
    codigoSalaDisplay: document.getElementById('codigo-sala-display'),
    estadoConexion: document.getElementById('estado-conexion'),
    salaInfo: document.getElementById('sala-info'),
    mascotaJugador: document.getElementById('mascota-jugador'),
    mascotaEnemigo: document.getElementById('mascota-enemigo'),
    vidaJugador: document.getElementById('VidaPlayer'),
    vidaRival: document.getElementById('VidaRival'),
    ataquesJugador: document.querySelector('.historial-ataques.jugador'),
    ataquesEnemigo: document.querySelector('.historial-ataques.enemigo')
  },
  modal: {
    contenedor: document.getElementById('modal-resultado'),
    mensaje: document.getElementById('modal-mensaje')
  }
};

// Inicialización del juego
function iniciarJuego() {
  // Ocultar secciones iniciales
  ocultarSeccion(elementos.secciones.seleccion);
  ocultarSeccion(elementos.secciones.ataque);
  elementos.modal.contenedor.classList.remove('activo');

  // Configurar eventos de multijugador
  elementos.botones.crearSala.addEventListener('click', crearSala);
  elementos.botones.unirseSala.addEventListener('click', unirseSala);
  elementos.botones.seleccionar.addEventListener('click', seleccionarPuchamon);
  elementos.botones.fuego.addEventListener('click', () => realizarAtaque(TIPOS.FUEGO));
  elementos.botones.agua.addEventListener('click', () => realizarAtaque(TIPOS.AGUA));
  elementos.botones.planta.addEventListener('click', () => realizarAtaque(TIPOS.PLANTA));
  elementos.botones.modalReiniciar.addEventListener('click', reiniciarJuego);

  // Iniciar conexión WebSocket
  conectarWebSocket();
}

// Funciones de WebSocket
function conectarWebSocket() {
  ws = new WebSocket('ws://localhost:3000');

  ws.onopen = () => {
    console.log('Conectado al servidor');
  };

  ws.onmessage = (evento) => {
    const data = JSON.parse(evento.data);
    manejarMensajeWebSocket(data);
  };

  ws.onclose = () => {
    console.log('Desconectado del servidor');
    mostrarMensajeEstado('Desconectado del servidor', 'error');
  };

  ws.onerror = (error) => {
    console.error('Error de WebSocket:', error);
    mostrarMensajeEstado('Error de conexión', 'error');
  };
}

function manejarMensajeWebSocket(data) {
  switch(data.tipo) {
    case 'sala_creada':
      ESTADO_JUEGO.salaId = data.salaId;
      ESTADO_JUEGO.jugador.id = data.jugadorId;
      mostrarInfoSala(data.salaId);
      break;

    case 'unido_exitosamente':
      ESTADO_JUEGO.salaId = data.salaId;
      ESTADO_JUEGO.jugador.id = data.jugadorId;
      mostrarInfoSala(data.salaId);
      mostrarSeccion(elementos.secciones.seleccion);
      break;

    case 'jugador_conectado':
      mostrarMensajeEstado('¡Rival conectado!', 'success');
      mostrarSeccion(elementos.secciones.seleccion);
      break;

    case 'puchamon_rival':
      ESTADO_JUEGO.rival.puchamon = PUCHAMONES[data.puchamon];
      actualizarInterfazRival();
      break;

    case 'ataque_rival':
      procesarAtaqueRival(data.ataque);
      break;

    case 'rival_desconectado':
      mostrarMensajeEstado('Tu rival se ha desconectado', 'error');
      finalizarCombate('Tu rival se ha desconectado');
      break;

    case 'error':
      mostrarMensajeEstado(data.mensaje, 'error');
      break;
  }
}

// Funciones de sala
function crearSala() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      tipo: 'crear_sala'
    }));
  } else {
    mostrarMensajeEstado('Error de conexión con el servidor', 'error');
  }
}

function unirseSala() {
  const codigoSala = elementos.displays.codigoSala.value.trim();
  if (!codigoSala) {
    mostrarMensajeEstado('Por favor, ingresa un código de sala', 'error');
    return;
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      tipo: 'unirse_sala',
      salaId: codigoSala
    }));
  } else {
    mostrarMensajeEstado('Error de conexión con el servidor', 'error');
  }
}

function mostrarInfoSala(codigoSala) {
  elementos.displays.codigoSalaDisplay.textContent = codigoSala;
  elementos.displays.salaInfo.style.display = 'block';
  elementos.displays.estadoConexion.textContent = 'Esperando a otro jugador...';
}

// Funciones de utilidad
function ocultarSeccion(seccion) {
  seccion.style.display = 'none';
}

function mostrarSeccion(seccion) {
  seccion.style.display = 'flex';
}

function mostrarMensajeEstado(mensaje, tipo) {
  elementos.displays.estadoConexion.textContent = mensaje;
  elementos.displays.estadoConexion.className = `estado-${tipo}`;
}

function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Selección de Puchamon
function seleccionarPuchamon() {
  const puchamonSeleccionado = obtenerPuchamonSeleccionado();
  
  if (!puchamonSeleccionado) {
    mostrarMensajeEstado('¡Debes seleccionar un PuchaMon!', 'error');
    return;
  }

  ESTADO_JUEGO.jugador.puchamon = PUCHAMONES[puchamonSeleccionado];
  
  // Notificar al servidor
  ws.send(JSON.stringify({
    tipo: 'seleccion_puchamon',
    puchamon: puchamonSeleccionado
  }));
  
  actualizarInterfazJugador();
  ocultarSeccion(elementos.secciones.seleccion);
  mostrarSeccion(elementos.secciones.ataque);
}

function obtenerPuchamonSeleccionado() {
  const opciones = ['Charmander', 'Squirtle', 'Bulbasaur'];
  return opciones.find(opcion => document.getElementById(opcion).checked);
}

// Sistema de combate
async function realizarAtaque(tipoAtaque) {
  if (!ESTADO_JUEGO.jugador.puchamon || !ESTADO_JUEGO.rival.puchamon) return;
  
  deshabilitarBotonesAtaque(true);
  
  try {
    // Enviar ataque al servidor
    ws.send(JSON.stringify({
      tipo: 'ataque',
      ataque: tipoAtaque
    }));

    const daño = calcularDaño(tipoAtaque);
    const efectividad = calcularEfectividad(tipoAtaque, ESTADO_JUEGO.rival.puchamon.tipo);
    const mensaje = `${ESTADO_JUEGO.jugador.puchamon.nombre} usó ${tipoAtaque} - ${daño} de daño ${efectividad}`;
    
    await animarAtaque('jugador', tipoAtaque);
    actualizarVida('rival', daño);
    agregarMensajeHistorial(mensaje, true);
    
    if (ESTADO_JUEGO.rival.vida <= 0) {
      finalizarCombate('¡Has ganado el combate! 🏆');
    }
  } catch (error) {
    console.error('Error durante el ataque:', error);
  } finally {
    deshabilitarBotonesAtaque(false);
  }
}

async function procesarAtaqueRival(tipoAtaque) {
  const daño = calcularDaño(tipoAtaque);
  const efectividad = calcularEfectividad(tipoAtaque, ESTADO_JUEGO.jugador.puchamon.tipo);
  const mensaje = `${ESTADO_JUEGO.rival.puchamon.nombre} usó ${tipoAtaque} - ${daño} de daño ${efectividad}`;
  
  await animarAtaque('enemigo', tipoAtaque);
  actualizarVida('jugador', daño);
  agregarMensajeHistorial(mensaje, false);
  
  if (ESTADO_JUEGO.jugador.vida <= 0) {
    finalizarCombate('Has perdido el combate... 😢');
  }
}

// Funciones de combate
function calcularDaño(tipoAtaque) {
  const atacante = tipoAtaque === ESTADO_JUEGO.jugador.puchamon.tipo ? ESTADO_JUEGO.jugador : ESTADO_JUEGO.rival;
  const defensor = atacante === ESTADO_JUEGO.jugador ? ESTADO_JUEGO.rival : ESTADO_JUEGO.jugador;
  
  let daño = 20; // Daño base
  
  // Verificar efectividad
  if (EFECTIVIDAD[tipoAtaque].fuerte === defensor.puchamon.tipo) {
    daño *= 1.5; // Daño aumentado por ser efectivo
  } else if (EFECTIVIDAD[tipoAtaque].debil === defensor.puchamon.tipo) {
    daño *= 0.5; // Daño reducido por ser poco efectivo
  }
  
  return Math.round(daño);
}

async function animarAtaque(tipo, tipoAtaque) {
  const contenedor = document.querySelector(`.puchamon-sprite.${tipo}`);
  const efecto = contenedor.querySelector('.efecto-ataque');
  
  try {
    // Añadir clases de animación
    contenedor.classList.add(`atacando-${tipo}`);
    efecto.classList.add(`ataque-${tipoAtaque.toLowerCase()}`);
    efecto.style.opacity = '1';
    
    // Esperar a que termine la animación
    await esperar(1000);
  } finally {
    // Asegurarse de que las clases se remuevan incluso si hay un error
    contenedor.classList.remove(`atacando-${tipo}`);
    efecto.classList.remove(`ataque-${tipoAtaque.toLowerCase()}`);
    efecto.style.opacity = '0';
  }
}

function actualizarVida(tipo, daño) {
  const objetivo = tipo === 'jugador' ? ESTADO_JUEGO.jugador : ESTADO_JUEGO.rival;
  objetivo.vida = Math.max(0, objetivo.vida - daño);
  
  // Actualizar barra de vida y contador
  const barraVida = document.querySelector(`.vida-actual.${tipo === 'jugador' ? 'jugador' : 'enemigo'}`);
  const contadorVida = document.querySelector(`#Vida${tipo === 'jugador' ? 'Player' : 'Rival'}`);
  
  if (barraVida && contadorVida) {
    barraVida.style.width = `${objetivo.vida}%`;
    contadorVida.textContent = objetivo.vida;
    
    // Animar recepción de daño
    const sprite = document.querySelector(`.puchamon-sprite.${tipo === 'jugador' ? 'jugador' : 'enemigo'}`);
    if (sprite) {
      sprite.classList.add('recibiendo-daño');
      setTimeout(() => sprite.classList.remove('recibiendo-daño'), 500);
    }
  }
}

function deshabilitarBotonesAtaque(deshabilitar) {
  elementos.botones.fuego.disabled = deshabilitar;
  elementos.botones.agua.disabled = deshabilitar;
  elementos.botones.planta.disabled = deshabilitar;
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function obtenerAtaqueRival() {
  const tipos = Object.values(TIPOS);
  return tipos[aleatorio(0, tipos.length - 1)];
}

function calcularResultadoCombate(ataqueJugador, ataqueRival) {
  if (ataqueJugador === ataqueRival) return 'empate';
  
  const efectividadJugador = EFECTIVIDAD[ataqueJugador];
  if (efectividadJugador.fuerte === ataqueRival) return 'victoria';
  if (efectividadJugador.debil === ataqueRival) return 'derrota';
  
  return 'normal';
}

function aplicarDaño(resultado) {
  switch (resultado) {
    case 'victoria':
      ESTADO_JUEGO.rival.vida--;
      mostrarMensaje('¡Ataque super efectivo! ¡Has ganado este turno! 🎯', 'success');
      break;
    case 'derrota':
      ESTADO_JUEGO.jugador.vida--;
      mostrarMensaje('¡Tu rival ha ganado este turno! 😢', 'error');
      break;
    case 'empate':
      mostrarMensaje('¡Empate! Los ataques se han neutralizado ⚔️', 'info');
      break;
  }
  
  actualizarInterfaz();
}

// Interfaz y mensajes
function actualizarInterfaz() {
  elementos.displays.mascotaJugador.textContent = ESTADO_JUEGO.jugador.puchamon.nombre;
  elementos.displays.mascotaEnemigo.textContent = ESTADO_JUEGO.rival.puchamon.nombre;
  elementos.displays.vidaJugador.textContent = ESTADO_JUEGO.jugador.vida;
  elementos.displays.vidaRival.textContent = ESTADO_JUEGO.rival.vida;
}

function actualizarHistorialAtaques(ataqueJugador, ataqueRival) {
  const nuevoAtaqueJugador = crearElementoAtaque(ataqueJugador, 'jugador');
  const nuevoAtaqueRival = crearElementoAtaque(ataqueRival, 'rival');
  
  elementos.displays.ataquesJugador.appendChild(nuevoAtaqueJugador);
  elementos.displays.ataquesEnemigo.appendChild(nuevoAtaqueRival);
}

function crearElementoAtaque(tipo, origen) {
  const elemento = document.createElement('p');
  elemento.className = `ataque-${origen}`;
  elemento.textContent = `Ataque de ${tipo}`;
  return elemento;
}

function mostrarMensaje(mensaje, tipo) {
  elementos.displays.resultado.textContent = mensaje;
  elementos.displays.resultado.className = `mensaje-batalla mensaje-${tipo}`;
}

// Finalización del juego
function combateTerminado() {
  return ESTADO_JUEGO.jugador.vida <= 0 || ESTADO_JUEGO.rival.vida <= 0;
}

function finalizarCombate(mensaje) {
  // Añadir efectos visuales al ganador/perdedor
  const spriteJugador = document.querySelector('.puchamon-sprite.jugador');
  const spriteEnemigo = document.querySelector('.puchamon-sprite.enemigo');
  
  spriteJugador.classList.add('derrota');
  spriteEnemigo.classList.add('derrota');
  
  // Mostrar modal con resultado
  elementos.modal.mensaje.textContent = mensaje;
  elementos.modal.contenedor.classList.add('activo');
  
  deshabilitarBotonesAtaque(true);
}

// Efectos adicionales
function agregarEfectosSonido() {
  // Aquí se pueden agregar efectos de sonido para los ataques y eventos
  const audio = {
    seleccion: new Audio('ruta/sonido-seleccion.mp3'),
    ataque: new Audio('ruta/sonido-ataque.mp3'),
    victoria: new Audio('ruta/sonido-victoria.mp3'),
    derrota: new Audio('ruta/sonido-derrota.mp3')
  };
}

function agregarAnimaciones() {
  // Aquí se pueden agregar animaciones CSS para los ataques y eventos
  document.querySelectorAll('.tarjeta-puchamon').forEach(tarjeta => {
    tarjeta.addEventListener('mouseover', () => {
      tarjeta.style.transform = 'scale(1.05)';
    });
    
    tarjeta.addEventListener('mouseout', () => {
      tarjeta.style.transform = 'scale(1)';
    });
  });
}

function reiniciarJuego() {
  elementos.modal.contenedor.classList.remove('activo');
  location.reload();
}

function agregarMensajeHistorial(mensaje, esJugador = true) {
  const historial = document.querySelector(`.historial-ataques.${esJugador ? 'jugador' : 'enemigo'}`);
  const p = document.createElement('p');
  p.textContent = mensaje;
  
  // Añadir el mensaje al principio del historial
  if (historial.querySelector('h4')) {
    historial.insertBefore(p, historial.querySelector('h4').nextSibling);
  } else {
    historial.appendChild(p);
  }
  
  // Limitar el historial a los últimos 5 mensajes por lado
  const mensajes = historial.querySelectorAll('p');
  while (mensajes.length > 5) {
    historial.removeChild(mensajes[mensajes.length - 1]);
  }

  // Hacer scroll al último mensaje
  p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function calcularEfectividad(tipoAtaque, tipoDefensor) {
  if (EFECTIVIDAD[tipoAtaque].fuerte === tipoDefensor) {
    return '(¡Super efectivo! 💥)';
  } else if (EFECTIVIDAD[tipoAtaque].debil === tipoDefensor) {
    return '(Poco efectivo... 😕)';
  }
  return '';
}

// Iniciar el juego cuando se carga la página
window.addEventListener('load', iniciarJuego);

