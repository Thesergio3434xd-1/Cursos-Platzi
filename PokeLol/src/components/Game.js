import WebSocketService from '../services/WebSocketService.js';
import { PUCHAMONES, CONFIG } from '../config/gameConfig.js';
import { calcularDaño, actualizarBarraVida, generarMensajeAtaque, iniciarContador, lanzarMoneda, animarAtaque } from '../utils/gameUtils.js';
import { animarDaño } from '../utils/animationUtils.js';

class Game {
    constructor() {
        this.inicializarVariables();
        this.configurarWebSocket();
        this.agregarEventListeners();
    }

    inicializarVariables() {
        this.salaId = null;
        this.jugadorId = null;
        this.puchamonJugador = null;
        this.puchamonRival = null;
        this.turnoActual = null;
        this.vidaJugador = CONFIG.VIDA_INICIAL;
        this.vidaRival = CONFIG.VIDA_INICIAL;
    }

    configurarWebSocket() {
        WebSocketService.setCallbacks({
            onConnect: () => this.actualizarEstadoConexion('Conectado al servidor', 'success'),
            onDisconnect: () => this.actualizarEstadoConexion('Desconectado del servidor', 'error'),
            onError: () => this.actualizarEstadoConexion('Error de conexión', 'error'),
            onMessage: (data) => this.manejarMensajeServidor(data)
        });
        
        WebSocketService.connect();
    }

    agregarEventListeners() {
        // Eventos de sala
        document.getElementById('crear-sala').addEventListener('click', () => {
            WebSocketService.send({ tipo: 'crear_sala' });
        });

        document.getElementById('unirse-sala').addEventListener('click', () => {
            const codigo = document.getElementById('codigo-sala').value;
            if (codigo) {
                WebSocketService.send({ 
                    tipo: 'unirse_sala',
                    salaId: codigo
                });
            }
        });

        // Evento para reiniciar juego
        document.getElementById('reiniciar-juego')?.addEventListener('click', () => {
            this.reiniciarJuego();
        });
    }

    actualizarEstadoConexion(mensaje, tipo) {
        const estadoElement = document.getElementById('estado-conexion');
        estadoElement.textContent = mensaje;
        estadoElement.className = `estado-${tipo}`;
    }

    manejarMensajeServidor(data) {
        console.log('Mensaje recibido:', data);
        switch(data.tipo) {
            case 'sala_creada':
                this.manejarSalaCreada(data);
                break;
            case 'unido_exitosamente':
                this.manejarUnionExitosa(data);
                break;
            case 'jugador_conectado':
                this.manejarJugadorConectado(data);
                break;
            case 'puchamon_rival':
                this.manejarSeleccionRival(data);
                break;
            case 'esperando_seleccion':
                this.actualizarEstadoConexion(data.mensaje, 'info');
                break;
            case 'iniciar_batalla':
                this.iniciarBatallaConContador(data.primerTurno);
                break;
            case 'ataque_rival':
                this.manejarAtaqueRival(data);
                break;
            case 'error':
                this.mostrarError(data.mensaje);
                break;
            case 'rival_desconectado':
                this.manejarDesconexionRival(data);
                break;
        }
    }

    manejarSalaCreada(data) {
        this.salaId = data.salaId;
        this.jugadorId = data.jugadorId;
        this.turnoActual = 'jugador1';
        this.actualizarEstadoConexion(`Sala creada. Código: ${this.salaId}`, 'success');
        this.mostrarSeleccionPuchamon();
    }

    manejarUnionExitosa(data) {
        this.salaId = data.salaId;
        this.jugadorId = data.jugadorId;
        this.actualizarEstadoConexion('¡Te has unido a la sala!', 'success');
        this.mostrarSeleccionPuchamon();
    }

    manejarJugadorConectado(data) {
        this.actualizarEstadoConexion(data.mensaje, 'success');
    }

    mostrarSeleccionPuchamon() {
        document.getElementById('seleccion-sala').style.display = 'none';
        const seleccionPuchamon = document.getElementById('seleccion-puchamon');
        seleccionPuchamon.style.display = 'block';

        // Generar opciones de Puchamon
        const opcionesContainer = seleccionPuchamon.querySelector('.puchamon-options');
        opcionesContainer.innerHTML = Object.entries(PUCHAMONES).map(([id, puchamon]) => `
            <label class="puchamon-option">
                <input type="radio" name="puchamon" value="${id}">
                <div class="puchamon-card">
                    <img src="${puchamon.imagen}" alt="${puchamon.nombre}">
                    <h3>${puchamon.nombre}</h3>
                    <span class="tipo-badge">${puchamon.tipo}</span>
                </div>
            </label>
        `).join('');

        // Agregar botón de selección
        if (!document.getElementById('confirmar-puchamon')) {
            const botonConfirmar = document.createElement('button');
            botonConfirmar.id = 'confirmar-puchamon';
            botonConfirmar.className = 'boton-principal';
            botonConfirmar.textContent = 'Confirmar Selección';
            botonConfirmar.addEventListener('click', () => this.confirmarSeleccionPuchamon());
            seleccionPuchamon.appendChild(botonConfirmar);
        }
    }

    confirmarSeleccionPuchamon() {
        const puchamonSeleccionado = document.querySelector('input[name="puchamon"]:checked');
        if (!puchamonSeleccionado) {
            this.mostrarError('Por favor, selecciona un Puchamon');
            return;
        }

        const puchamonId = puchamonSeleccionado.value;
        this.puchamonJugador = PUCHAMONES[puchamonId];
        
        // Deshabilitar selección después de confirmar
        document.querySelectorAll('.puchamon-option input[type="radio"]').forEach(input => {
            input.disabled = true;
        });
        document.getElementById('confirmar-puchamon').disabled = true;

        WebSocketService.send({
            tipo: 'seleccion_puchamon',
            puchamon: puchamonId
        });

        // Mostrar mensaje de espera
        this.actualizarEstadoConexion('Esperando a que el rival seleccione su Puchamon...', 'info');
    }

    async iniciarBatallaConContador(primerTurno) {
        this.turnoActual = primerTurno;
        
        // Mostrar quién ganó el lanzamiento
        const mensaje = this.turnoActual === this.jugadorId ?
            '¡Ganaste el lanzamiento! Empiezas tú.' :
            'Tu rival ganó el lanzamiento. Espera tu turno.';
        
        this.actualizarEstadoConexion('Lanzando moneda...', 'info');
        
        // Animar el lanzamiento de moneda
        await lanzarMoneda(this.jugadorId);
        
        // Iniciar cuenta regresiva
        await iniciarContador();
        
        // Actualizar estado con el resultado
        this.actualizarEstadoConexion(mensaje, 'success');

        // Mostrar pantalla de batalla
        document.getElementById('seleccion-puchamon').style.display = 'none';
        const campoBatalla = document.getElementById('campo-batalla');
        campoBatalla.style.display = 'block';

        // Actualizar interfaz
        document.getElementById('nombre-jugador').textContent = this.puchamonJugador.nombre;
        document.getElementById('sprite-jugador').src = this.puchamonJugador.imagen;
        document.getElementById('nombre-rival').textContent = this.puchamonRival.nombre;
        document.getElementById('sprite-enemigo').src = this.puchamonRival.imagen;

        this.actualizarBarrasVida();
        this.generarBotonesAtaque();

        // Habilitar/deshabilitar botones según el turno
        if (this.turnoActual === this.jugadorId) {
            this.habilitarBotonesAtaque();
        } else {
            this.deshabilitarBotonesAtaque();
        }
    }

    manejarSeleccionRival(data) {
        this.puchamonRival = PUCHAMONES[data.puchamon];
    }

    generarBotonesAtaque() {
        const controlesAtaque = document.querySelector('.controles-ataque');
        controlesAtaque.innerHTML = Object.entries(this.puchamonJugador.ataques).map(([tipo, daño]) => `
            <button class="boton-ataque tipo-${tipo}" data-tipo="${tipo}" data-daño="${daño}">
                ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
        `).join('');

        controlesAtaque.querySelectorAll('.boton-ataque').forEach(boton => {
            boton.addEventListener('click', (e) => this.realizarAtaque(e.target.dataset.tipo, parseInt(e.target.dataset.daño)));
        });
    }

    realizarAtaque(tipo, daño) {
        // Si ya está finalizada la batalla, no hacer nada
        if (this.vidaJugador <= 0 || this.vidaRival <= 0) {
            console.log('Batalla ya finalizada, no se puede atacar');
            return;
        }
        
        // Verificar si es nuestro turno
        if (this.turnoActual !== this.jugadorId) {
            this.mostrarError('¡No es tu turno!');
            return;
        }

        // Deshabilitar botones durante el ataque
        this.deshabilitarBotonesAtaque();
        
        // Calcular daño final
        const dañoFinal = calcularDaño(daño, tipo, this.puchamonRival.tipo);
        
        // Actualizar vida del rival y verificar si fue derrotado
        this.vidaRival = Math.max(0, this.vidaRival - dañoFinal);
        const rivalDerrotado = this.vidaRival <= 0;
        
        // Enviar ataque al servidor
        WebSocketService.send({
            tipo: 'ataque',
            ataque: { tipo, daño: dañoFinal }
        });
        
        // Animar el ataque
        const spriteJugador = document.querySelector('.puchamon-sprite.jugador');
        const spriteEnemigo = document.querySelector('.puchamon-sprite.enemigo');
        animarAtaque(spriteJugador, spriteEnemigo);
        
        // Actualizar interfaz
        this.actualizarBarrasVida();
        this.agregarMensajeHistorial(generarMensajeAtaque(
            this.puchamonJugador.nombre,
            this.puchamonRival.nombre,
            dañoFinal,
            tipo
        ));
        
        // Si el rival fue derrotado, finalizar la batalla
        if (rivalDerrotado) {
            console.log('Rival derrotado, finalizando batalla');
            setTimeout(() => {
                this.finalizarBatalla(true);
            }, 500);
            return;
        }
        
        // Cambiar el turno solo si la batalla continúa
        this.turnoActual = this.jugadorId === 'jugador1' ? 'jugador2' : 'jugador1';
    }

    manejarAtaqueRival(data) {
        // Si ya está finalizada la batalla, no hacer nada
        if (this.vidaJugador <= 0 || this.vidaRival <= 0) {
            console.log('Batalla ya finalizada, ignorando ataque rival');
            return;
        }

        const { tipo, daño } = data.ataque;
        
        // Actualizar vida del jugador y verificar si fue derrotado
        this.vidaJugador = Math.max(0, this.vidaJugador - daño);
        const jugadorDerrotado = this.vidaJugador <= 0;
        
        // Animar el ataque rival
        const spriteJugador = document.querySelector('.puchamon-sprite.jugador');
        const spriteEnemigo = document.querySelector('.puchamon-sprite.enemigo');
        animarAtaque(spriteEnemigo, spriteJugador);
        
        // Actualizar la interfaz
        this.actualizarBarrasVida();
        this.agregarMensajeHistorial(generarMensajeAtaque(
            this.puchamonRival.nombre,
            this.puchamonJugador.nombre,
            daño,
            tipo
        ));
        
        // Si el jugador fue derrotado, finalizar la batalla
        if (jugadorDerrotado) {
            console.log('Jugador derrotado, finalizando batalla');
            setTimeout(() => {
                this.finalizarBatalla(false);
            }, 500);
            return;
        }
        
        // Solo cambiar el turno si la batalla continúa
        this.turnoActual = this.jugadorId;
        this.habilitarBotonesAtaque();
    }

    actualizarBarrasVida() {
        actualizarBarraVida(document.getElementById('vida-jugador'), this.vidaJugador, CONFIG.VIDA_INICIAL);
        actualizarBarraVida(document.getElementById('vida-rival'), this.vidaRival, CONFIG.VIDA_INICIAL);
    }

    agregarMensajeHistorial(mensaje) {
        const historial = document.getElementById('historial-ataques');
        const mensajeElement = document.createElement('p');
        mensajeElement.textContent = mensaje;
        historial.appendChild(mensajeElement);
        historial.scrollTop = historial.scrollHeight;
    }

    deshabilitarBotonesAtaque() {
        document.querySelectorAll('.boton-ataque').forEach(boton => {
            boton.disabled = true;
        });
    }

    habilitarBotonesAtaque() {
        document.querySelectorAll('.boton-ataque').forEach(boton => {
            boton.disabled = false;
        });
    }

    finalizarBatalla(victoria) {
        console.log('Finalizando batalla:', {
            victoria,
            vidaJugador: this.vidaJugador,
            vidaRival: this.vidaRival,
            turnoActual: this.turnoActual
        });
        
        // Asegurarse de que los botones estén deshabilitados
        this.deshabilitarBotonesAtaque();
        
        // Obtener el modal y configurar el mensaje
        const modal = document.getElementById('modal-resultado');
        const titulo = modal.querySelector('.modal-titulo');
        const mensaje = document.getElementById('mensaje-resultado');
        
        titulo.textContent = victoria ? '¡Victoria!' : 'Derrota';
        mensaje.textContent = victoria ? 
            `¡Has ganado la batalla! Tu ${this.puchamonJugador.nombre} ha derrotado al ${this.puchamonRival.nombre} rival.` : 
            `Has perdido la batalla... Tu ${this.puchamonJugador.nombre} ha sido derrotado por el ${this.puchamonRival.nombre} rival.`;
        
        // Asegurarse de que el modal sea visible
        modal.style.display = 'flex';
        modal.classList.add('activo');
        
        // Agregar mensaje al historial
        this.agregarMensajeHistorial(victoria ? 
            '¡Has ganado la batalla!' : 
            'Has perdido la batalla...');
            
        console.log('Modal mostrado:', modal.classList.contains('activo'));
    }

    reiniciarJuego() {
        window.location.reload();
    }

    manejarDesconexionRival(data) {
        this.mostrarError(data.mensaje);
        setTimeout(() => this.reiniciarJuego(), 3000);
    }

    mostrarError(mensaje) {
        this.actualizarEstadoConexion(mensaje, 'error');
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Game();
}); 