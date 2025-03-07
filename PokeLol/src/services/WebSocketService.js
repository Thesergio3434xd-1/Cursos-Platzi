import { CONFIG } from '../config/gameConfig.js';

class WebSocketService {
    constructor() {
        this.ws = null;
        this.callbacks = {
            onConnect: () => {},
            onDisconnect: () => {},
            onError: () => {},
            onMessage: () => {}
        };
    }

    connect() {
        this.ws = new WebSocket(CONFIG.WS_URL);
        
        this.ws.onopen = () => {
            console.log('🎮 Conectado al servidor');
            this.callbacks.onConnect();
        };

        this.ws.onclose = () => {
            console.log('❌ Desconectado del servidor');
            this.callbacks.onDisconnect();
        };

        this.ws.onerror = (error) => {
            console.error('🚨 Error en la conexión:', error);
            this.callbacks.onError(error);
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.callbacks.onMessage(data);
        };
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('🚨 No hay conexión con el servidor');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

export default new WebSocketService(); 