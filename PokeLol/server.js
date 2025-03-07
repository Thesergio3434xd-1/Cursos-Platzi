const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ 
  server,
  // Agregar configuración de ping para mantener conexiones vivas
  clientTracking: true,
  // Tiempo máximo de inactividad antes de considerar la conexión muerta
  pingTimeout: 30000,
  // Intervalo de ping
  pingInterval: 10000
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, './')));

// Almacenar las salas de juego y conexiones activas
const salas = new Map();
const conexionesActivas = new Set();

// Estructura de sala
function crearSala(jugador1) {
    return {
        jugador1,
        jugador2: null,
        seleccionJugador1: null,
        seleccionJugador2: null,
        codigo: Math.random().toString(36).substring(7),
        ultimaActividad: Date.now()
    };
}

// Función para imprimir información del servidor
function imprimirInfoServidor(puerto) {
    console.clear();
    console.log('='.repeat(50));
    console.log('🎮 Servidor PuchaLol iniciado');
    console.log('='.repeat(50));
    console.log('📡 WebSocket listo en: ws://localhost:' + puerto);
    console.log('🌐 Abre el juego en: http://localhost:' + puerto);
    console.log('='.repeat(50));
}

// Función para limpiar conexiones muertas
function limpiarConexionesMuertas() {
    for (const ws of conexionesActivas) {
        if (!ws.isAlive) {
            console.log('🧹 Limpiando conexión muerta');
            ws.terminate();
            conexionesActivas.delete(ws);
            continue;
        }
        ws.isAlive = false;
        ws.ping();
    }
}

function limpiarSalasInactivas() {
    const ahora = Date.now();
    for (const [salaId, sala] of salas.entries()) {
        if (ahora - sala.ultimaActividad > 300000) { // 5 minutos
            console.log('🧹 Limpiando sala inactiva:', salaId);
            
            // Notificar a los jugadores si aún están conectados
            if (sala.jugador1 && sala.jugador1.readyState === WebSocket.OPEN) {
                sala.jugador1.send(JSON.stringify({
                    tipo: 'error',
                    mensaje: 'La sala ha expirado por inactividad'
                }));
            }
            if (sala.jugador2 && sala.jugador2.readyState === WebSocket.OPEN) {
                sala.jugador2.send(JSON.stringify({
                    tipo: 'error',
                    mensaje: 'La sala ha expirado por inactividad'
                }));
            }
            salas.delete(salaId);
        }
    }
}

// Configurar intervalo de limpieza
const intervaloLimpieza = setInterval(() => {
    limpiarConexionesMuertas();
    limpiarSalasInactivas();
}, 30000);

// Manejar conexiones WebSocket
wss.on('connection', (ws, req) => {
    console.log('👤 Nuevo jugador conectado desde:', req.socket.remoteAddress);
    
    // Agregar a conexiones activas
    conexionesActivas.add(ws);
    ws.isAlive = true;
    
    let salaId = null;
    let jugadorId = null;

    // Configurar ping-pong para mantener la conexión viva
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (mensaje) => {
        try {
            const data = JSON.parse(mensaje);
            console.log('📨 Mensaje recibido:', data.tipo);
            
            switch(data.tipo) {
                case 'crear_sala':
                    // Verificar si el jugador ya está en una sala
                    if (salaId) {
                        ws.send(JSON.stringify({
                            tipo: 'error',
                            mensaje: 'Ya estás en una sala'
                        }));
                        return;
                    }
                    
                    salaId = Math.random().toString(36).substring(7);
                    jugadorId = 'jugador1';
                    salas.set(salaId, {
                        jugador1: ws,
                        codigo: salaId,
                        ultimaActividad: Date.now()
                    });
                    console.log('🎲 Nueva sala creada:', salaId);
                    ws.send(JSON.stringify({
                        tipo: 'sala_creada',
                        salaId,
                        jugadorId
                    }));
                    break;

                case 'unirse_sala':
                    // Verificar si el jugador ya está en una sala
                    if (salaId) {
                        ws.send(JSON.stringify({
                            tipo: 'error',
                            mensaje: 'Ya estás en una sala'
                        }));
                        return;
                    }

                    // Verificar si la sala existe
                    if (!data.salaId || !salas.has(data.salaId)) {
                        console.log('❌ Intento de unirse a sala inexistente:', data.salaId);
                        ws.send(JSON.stringify({
                            tipo: 'error',
                            mensaje: 'La sala no existe'
                        }));
                        return;
                    }

                    const sala = salas.get(data.salaId);
                    
                    // Verificar si la sala está activa
                    if (Date.now() - sala.ultimaActividad > 300000) {
                        salas.delete(data.salaId);
                        ws.send(JSON.stringify({
                            tipo: 'error',
                            mensaje: 'La sala ha expirado'
                        }));
                        return;
                    }
                    
                    // Verificar si la sala está llena
                    if (sala.jugador2) {
                        console.log('❌ Intento de unirse a sala llena:', data.salaId);
                        ws.send(JSON.stringify({
                            tipo: 'error',
                            mensaje: 'La sala está llena'
                        }));
                        return;
                    }

                    // Verificar si el jugador1 sigue conectado
                    if (sala.jugador1.readyState !== WebSocket.OPEN) {
                        salas.delete(data.salaId);
                        ws.send(JSON.stringify({
                            tipo: 'error',
                            mensaje: 'El anfitrión se ha desconectado'
                        }));
                        return;
                    }

                    // Unir al jugador a la sala
                    sala.jugador2 = ws;
                    jugadorId = 'jugador2';
                    salaId = data.salaId;
                    sala.ultimaActividad = Date.now();
                    
                    console.log('✅ Jugador 2 se unió a la sala:', salaId);

                    // Notificar a ambos jugadores
                    sala.jugador1.send(JSON.stringify({
                        tipo: 'jugador_conectado',
                        mensaje: '¡Jugador 2 se ha unido!'
                    }));
                    ws.send(JSON.stringify({
                        tipo: 'unido_exitosamente',
                        salaId,
                        jugadorId
                    }));
                    break;

                case 'seleccion_puchamon':
                    if (salaId && salas.has(salaId)) {
                        const sala = salas.get(salaId);
                        
                        // Guardar la selección del jugador
                        if (jugadorId === 'jugador1') {
                            sala.seleccionJugador1 = data.puchamon;
                        } else {
                            sala.seleccionJugador2 = data.puchamon;
                        }

                        // Notificar al otro jugador
                        const otroJugador = jugadorId === 'jugador1' ? sala.jugador2 : sala.jugador1;
                        if (otroJugador) {
                            otroJugador.send(JSON.stringify({
                                tipo: 'puchamon_rival',
                                puchamon: data.puchamon
                            }));
                        }

                        // Si ambos jugadores han seleccionado, iniciar la batalla
                        if (sala.seleccionJugador1 && sala.seleccionJugador2) {
                            console.log('🎮 Iniciando batalla en sala:', salaId);
                            const primerTurno = Math.random() < 0.5 ? 'jugador1' : 'jugador2';
                            
                            // Notificar a ambos jugadores que la batalla comienza
                            sala.jugador1.send(JSON.stringify({
                                tipo: 'iniciar_batalla',
                                primerTurno
                            }));
                            sala.jugador2.send(JSON.stringify({
                                tipo: 'iniciar_batalla',
                                primerTurno
                            }));
                        } else {
                            // Notificar que estamos esperando al otro jugador
                            ws.send(JSON.stringify({
                                tipo: 'esperando_seleccion',
                                mensaje: 'Esperando a que el rival seleccione su Puchamon...'
                            }));
                        }
                    }
                    break;

                case 'ataque':
                    if (salaId && salas.has(salaId)) {
                        const sala = salas.get(salaId);
                        const otroJugador = jugadorId === 'jugador1' ? sala.jugador2 : sala.jugador1;
                        if (otroJugador) {
                            console.log('⚔️ Ataque en sala:', salaId);
                            otroJugador.send(JSON.stringify({
                                tipo: 'ataque_rival',
                                ataque: data.ataque
                            }));
                        }
                    }
                    break;

                case 'resultado_moneda':
                    if (salaId && salas.has(salaId)) {
                        const sala = salas.get(salaId);
                        const otroJugador = jugadorId === 'jugador1' ? sala.jugador2 : sala.jugador1;
                        if (otroJugador) {
                            console.log('🎲 Resultado de moneda en sala:', salaId);
                            otroJugador.send(JSON.stringify({
                                tipo: 'resultado_moneda',
                                primerTurno: data.primerTurno
                            }));
                        }
                    }
                    break;
            }
            
            // Actualizar timestamp de última actividad
            if (salaId && salas.has(salaId)) {
                salas.get(salaId).ultimaActividad = Date.now();
            }
            
        } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
            ws.send(JSON.stringify({
                tipo: 'error',
                mensaje: 'Error interno del servidor'
            }));
        }
    });

    ws.on('close', () => {
        // Limpiar conexión
        conexionesActivas.delete(ws);
        
        if (salaId && salas.has(salaId)) {
            const sala = salas.get(salaId);
            const otroJugador = jugadorId === 'jugador1' ? sala.jugador2 : sala.jugador1;
            
            if (otroJugador && otroJugador.readyState === WebSocket.OPEN) {
                console.log('👋 Jugador desconectado de la sala:', salaId);
                otroJugador.send(JSON.stringify({
                    tipo: 'rival_desconectado',
                    mensaje: 'Tu rival se ha desconectado'
                }));
            }
            
            // Si el jugador1 se desconecta, cerrar la sala
            if (jugadorId === 'jugador1' || !sala.jugador2) {
                console.log('🧹 Limpiando sala:', salaId);
                salas.delete(salaId);
            } else {
                // Si el jugador2 se desconecta, solo eliminarlo de la sala
                sala.jugador2 = null;
            }
        }
    });
});

// Limpiar recursos al cerrar el servidor
wss.on('close', () => {
    clearInterval(intervaloLimpieza);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    imprimirInfoServidor(PORT);
}); 