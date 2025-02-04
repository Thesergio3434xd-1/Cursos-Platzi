let saldo = 1000;

function realizarOperacion() {
    let opcion = prompt("¿Qué desea hacer?\n1. Consignar\n2. Retirar\n3. Salir");
    
    if (opcion === "3") {
        alert("Hasta luego!");
        return;
    }
    
    if (opcion === "1") {
        let valor = parseFloat(prompt("Digite el valor a consignar:"));
        if (!isNaN(valor) && valor > 0) {
            saldo += valor;
            alert("Acción realizada correctamente. Saldo: " + saldo);
        } else {
            alert("Valor inválido.");
        }
    } else if (opcion === "2") {
        let valor = parseFloat(prompt("Digite el valor a retirar:"));
        if (!isNaN(valor) && valor > 0) {
            if (valor > saldo) {
                alert("No se realizó la acción. Saldo: " + saldo);
            } else {
                saldo -= valor;
                alert("Acción realizada correctamente. Saldo: " + saldo);
            }
        } else {
            alert("Valor inválido.");
        }
    } else {
        alert("Opción incorrecta");
    }
    
    realizarOperacion(); // Llamada recursiva para seguir operando
}

document.addEventListener("DOMContentLoaded", function () {
    let boton = document.createElement("button");
    boton.textContent = "Iniciar Operaciones";
    boton.onclick = realizarOperacion;
    document.body.appendChild(boton);
});