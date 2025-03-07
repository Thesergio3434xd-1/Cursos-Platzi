export const calcularDaño = (ataque, tipo, tipoRival) => {
    let multiplicador = 1;
    
    // Sistema de ventajas/desventajas
    const ventajas = {
        fuego: 'planta',
        agua: 'fuego',
        planta: 'agua'
    };

    if (ventajas[tipo] === tipoRival) {
        multiplicador = 1.5;
    } else if (ventajas[tipoRival] === tipo) {
        multiplicador = 0.5;
    }

    return Math.floor(ataque * multiplicador);
};

export const actualizarBarraVida = (elemento, vidaActual, vidaMaxima) => {
    const porcentaje = (vidaActual / vidaMaxima) * 100;
    elemento.style.width = `${porcentaje}%`;
    
    // Cambiar color según la vida restante
    if (porcentaje > 60) {
        elemento.style.backgroundColor = 'var(--success-color)';
    } else if (porcentaje > 30) {
        elemento.style.backgroundColor = 'var(--warning-color)';
    } else {
        elemento.style.backgroundColor = 'var(--danger-color)';
    }
};

export const generarMensajeAtaque = (atacante, defensor, daño, tipo) => {
    return `${atacante} usó ataque de ${tipo} y causó ${daño} de daño a ${defensor}`;
};

export const iniciarContador = async () => {
    const contadorElement = document.createElement('div');
    contadorElement.className = 'contador';
    document.body.appendChild(contadorElement);

    const numeros = ['¡3!', '¡2!', '¡1!', '¡BATALLA!'];
    
    for (const numero of numeros) {
        // Mostrar el número
        contadorElement.textContent = numero;
        contadorElement.classList.add('contador-animacion');
        
        // Esperar a que termine la animación
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Remover la clase de animación y esperar un momento antes del siguiente número
        contadorElement.classList.remove('contador-animacion');
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Remover el elemento contador
    document.body.removeChild(contadorElement);
};

export const lanzarMoneda = async (jugadorId) => {
    const monedaElement = document.createElement('div');
    monedaElement.className = 'moneda';
    document.body.appendChild(monedaElement);

    // Simular giros de la moneda
    for (let i = 0; i < 10; i++) {
        monedaElement.textContent = i % 2 === 0 ? 'CARA' : 'CRUZ';
        monedaElement.className = 'moneda moneda-girando';
        await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Resultado final - jugador1 siempre ve CARA si gana, CRUZ si pierde
    // jugador2 siempre ve CRUZ si gana, CARA si pierde
    const resultado = Math.random() < 0.5 ? 'jugador1' : 'jugador2';
    
    // Determinar qué mostrar según el jugadorId
    let textoMostrar;
    if (jugadorId === 'jugador1') {
        textoMostrar = resultado === 'jugador1' ? 'CARA' : 'CRUZ';
    } else {
        textoMostrar = resultado === 'jugador2' ? 'CRUZ' : 'CARA';
    }
    
    monedaElement.textContent = textoMostrar;
    monedaElement.className = 'moneda moneda-resultado';
    
    // Mostrar por 2 segundos y luego remover
    await new Promise(resolve => setTimeout(resolve, 2000));
    document.body.removeChild(monedaElement);
    
    return resultado;
};

export const animarAtaque = (atacante, defensor) => {
    // Agregar clase de animación al atacante
    atacante.classList.add('atacando');
    
    // Después de 300ms, quitar la clase del atacante y agregar la de recibir daño al defensor
    setTimeout(() => {
        atacante.classList.remove('atacando');
        defensor.classList.add('recibiendo-daño');
        
        // Después de 500ms, quitar la clase del defensor
        setTimeout(() => {
            defensor.classList.remove('recibiendo-daño');
        }, 500);
    }, 300);
}; 