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

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
    console.log('Nuevo jugador conectado');
    let salaId = null;
    let jugadorId = null;

    ws.on('message', (mensaje) => {
        const data = JSON.parse(mensaje);
        
        switch(data.tipo) {
            case 'crear_sala':
                salaId = Math.random().toString(36).substring(7);
                jugadorId = 'jugador1';
                salas.set(salaId, {
                    jugador1: ws,
                    codigo: salaId
                });
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
                        ws.send(JSON.stringify({
                            tipo: 'error',
                            mensaje: 'La sala está llena'
                        }));
                    }
                } else {
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
                        otroJugador.send(JSON.stringify({
                            tipo: 'ataque_rival',
                            ataque: data.ataque
                        }));
                    }
                }
                break;
        }
    });

    ws.on('close', () => {
        if (salaId && salas.has(salaId)) {
            const sala = salas.get(salaId);
            const otroJugador = jugadorId === 'jugador1' ? sala.jugador2 : sala.jugador1;
            
            if (otroJugador) {
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
    console.log(`Servidor iniciado en puerto ${PORT}`);
}); 