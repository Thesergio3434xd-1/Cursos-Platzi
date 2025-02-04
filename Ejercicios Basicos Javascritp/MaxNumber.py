def encontrar_mayor(a, b, c, d):
    """Función para encontrar el número mayor entre cuatro números usando if"""
    mayor = a
    if b > mayor:
        mayor = b
    if c > mayor:
        mayor = c
    if d > mayor:
        mayor = d
    return mayor

# Ejemplo de uso
num1 = float(input("Ingrese el primer número: "))
num2 = float(input("Ingrese el segundo número: "))
num3 = float(input("Ingrese el tercer número: "))
num4 = float(input("Ingrese el cuarto número: "))

resultado = encontrar_mayor(num1, num2, num3, num4)
print(f"El número mayor es: {resultado}")
