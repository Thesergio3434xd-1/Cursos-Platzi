
document.addEventListener("DOMContentLoaded", function () {
    let tablero = "";
    for (let fila = 0; fila < 8; fila++) {
        for (let columna = 0; columna < 8; columna++) {
            tablero += (fila + columna) % 2 === 0 ? "⬜" : "⬛";
        }
        tablero += "\n";
    }
    document.body.innerHTML = `<pre>${tablero}</pre>`;
});
