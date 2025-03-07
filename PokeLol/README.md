# PuchaLol - Juego Multijugador

Un juego de batallas de Puchamones inspirado en Pokémon, ahora con modo multijugador online.

## Requisitos

- Node.js (versión 14 o superior)
- npm (viene con Node.js)

## Instalación

1. Clona este repositorio o descarga los archivos
2. Abre una terminal en la carpeta del proyecto
3. Instala las dependencias:

```bash
npm install
```

## Cómo Jugar

1. Inicia el servidor:

```bash
npm start
```

2. Abre tu navegador y ve a `http://localhost:3000`

3. Para jugar con un amigo:
   - Un jugador debe crear una sala (botón "Crear Sala")
   - El otro jugador debe unirse usando el código de sala mostrado
   - Ambos jugadores seleccionan su Puchamon
   - ¡Comienza la batalla!

## Controles

- Selecciona tu Puchamon haciendo clic en su tarjeta
- Durante la batalla, usa los botones de ataque:
  - 🔥 Fuego
  - 💧 Agua
  - 🌿 Planta

## Tipos y Efectividad

- Fuego es fuerte contra Planta, débil contra Agua
- Agua es fuerte contra Fuego, débil contra Planta
- Planta es fuerte contra Agua, débil contra Fuego

## Características

- Modo multijugador online en tiempo real
- Sistema de salas para jugar con amigos
- Animaciones de batalla
- Efectos visuales para ataques
- Historial de combate
- Diseño responsivo

## Desarrollo

Para ejecutar en modo desarrollo con recarga automática:

```bash
npm run dev
``` 