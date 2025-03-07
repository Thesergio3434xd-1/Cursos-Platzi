export const animarAtaque = (atacante, defensor) => {
    // Agregar clases de animación
    atacante.classList.add('atacando');
    defensor.classList.add('recibiendo-daño');

    // Remover clases después de la animación
    setTimeout(() => {
        atacante.classList.remove('atacando');
        defensor.classList.remove('recibiendo-daño');
    }, 500);
};

export const animarDaño = (elemento) => {
    elemento.classList.add('recibiendo-daño');
    setTimeout(() => {
        elemento.classList.remove('recibiendo-daño');
    }, 500);
}; 