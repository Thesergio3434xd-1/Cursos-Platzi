const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, './')));

// Almacenar las salas de juego
const salas = new Map();

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

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('👤 Nuevo jugador conectado');
    let salaId = null;
    let jugadorId = null;

    ws.on('message', (mensaje) => {
        try {
            const data = JSON.parse(mensaje);
            console.log('📨 Mensaje recibido:', data.tipo);
            
            switch(data.tipo) {
                case 'crear_sala':
                    salaId = Math.random().toString(36).substring(7);
                    jugadorId = 'jugador1';
                    salas.set(salaId, {
                        jugador1: ws,
                        codigo: salaId
                    });
                    console.log('🎲 Nueva sala creada:', salaId);
                    ws.send(JSON.stringify({
                        tipo: 'sala_creada',
                        salaId,
                        jugadorId
                    }));
                    break;

                case 'unirse_sala':
                    if (salas.has(data.salaId)) {
                        const sala = salas.get(data.salaId);
                        if (!sala.jugador2) {
                            sala.jugador2 = ws;
                            jugadorId = 'jugador2';
                            salaId = data.salaId;
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
                        } else {
                            console.log('❌ Intento de unirse a sala llena:', salaId);
                            ws.send(JSON.stringify({
                                tipo: 'error',
                                mensaje: 'La sala está llena'
                            }));
                        }
                    } else {
                        console.log('❌ Intento de unirse a sala inexistente:', data.salaId);
                        ws.send(JSON.stringify({
                            tipo: 'error',
                            mensaje: 'Sala no encontrada'
                        }));
                    }
                    break;

                case 'seleccion_puchamon':
                    if (salaId && salas.has(salaId)) {
                        const sala = salas.get(salaId);
                        const otroJugador = jugadorId === 'jugador1' ? sala.jugador2 : sala.jugador1;
                        if (otroJugador) {
                            console.log('🎭 Selección de Puchamon en sala:', salaId);
                            otroJugador.send(JSON.stringify({
                                tipo: 'puchamon_rival',
                                puchamon: data.puchamon
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
            }
        } catch (error) {
            console.error('❌ Error procesando mensaje:', error);
        }
    });

    ws.on('close', () => {
        if (salaId && salas.has(salaId)) {
            const sala = salas.get(salaId);
            const otroJugador = jugadorId === 'jugador1' ? sala.jugador2 : sala.jugador1;
            
            if (otroJugador) {
                console.log('👋 Jugador desconectado de la sala:', salaId);
                otroJugador.send(JSON.stringify({
                    tipo: 'rival_desconectado',
                    mensaje: 'Tu rival se ha desconectado'
                }));
            }
            
            salas.delete(salaId);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    imprimirInfoServidor(PORT);
}); 