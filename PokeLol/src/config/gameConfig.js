// Configuración del juego
export const PUCHAMONES = {
    charmander: {
        nombre: 'Charmander',
        tipo: 'fuego',
        imagen: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/004.png',
        ataques: {
            fuego: 25,
            normal: 15,
            especial: 35
        }
    },
    squirtle: {
        nombre: 'Squirtle',
        tipo: 'agua',
        imagen: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/007.png',
        ataques: {
            agua: 25,
            normal: 15,
            especial: 35
        }
    },
    bulbasaur: {
        nombre: 'Bulbasaur',
        tipo: 'planta',
        imagen: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/001.png',
        ataques: {
            planta: 25,
            normal: 15,
            especial: 35
        }
    }
};

// Determinar la URL del WebSocket basada en la URL actual
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsHost = window.location.hostname;
const isNgrok = wsHost.includes('ngrok-free.app');
const wsPort = ':3000';

export const CONFIG = {
    WS_URL: isNgrok ? `wss://${wsHost}` : `ws://localhost${wsPort}`,
    VIDA_INICIAL: 100,
    TIEMPO_ANIMACION: 500
}; 