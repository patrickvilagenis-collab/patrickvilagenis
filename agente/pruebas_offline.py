"""Pruebas offline (sin API ni red) de los bloques deterministas.

Verifican Manos (herramientas locales) y Memoria (corto/largo plazo + base
vectorial) sin necesidad del SDK de Anthropic ni de una API key.

Ejecuta:  python -m agente.pruebas_offline
"""
from __future__ import annotations

import tempfile
from pathlib import Path

from .manos import Manos
from .memoria import MemoriaCortoPlazo, MemoriaLargoPlazo


def _check(condicion: bool, mensaje: str) -> None:
    estado = "ok " if condicion else "FALLO"
    print(f"  [{estado}] {mensaje}")
    if not condicion:
        raise AssertionError(mensaje)


def probar_manos(ws: Path) -> None:
    print("Manos (herramientas):")
    manos = Manos(ws)

    salida, err = manos.ejecutar("calculadora", {"expresion": "2 ** 10 + 5 * 3"})
    _check(not err and "1039" in salida, f"calculadora -> {salida}")

    salida, err = manos.ejecutar("escribir_archivo", {"ruta": "n.txt", "contenido": "hola"})
    _check(not err, f"escribir_archivo -> {salida}")

    salida, err = manos.ejecutar("leer_archivo", {"ruta": "n.txt"})
    _check(not err and salida == "hola", f"leer_archivo -> {salida!r}")

    salida, err = manos.ejecutar("listar_archivos", {})
    _check(not err and "n.txt" in salida, f"listar_archivos -> {salida}")

    salida, err = manos.ejecutar("ejecutar_python", {"codigo": "print(sum(range(10)))"})
    _check(not err and "45" in salida, f"ejecutar_python -> {salida}")

    # La sandbox de rutas debe rechazar salir del workspace.
    salida, err = manos.ejecutar("leer_archivo", {"ruta": "../../etc/passwd"})
    _check(err, "leer_archivo bloquea rutas fuera del workspace")

    # Herramienta inexistente -> error controlado, no excepción.
    salida, err = manos.ejecutar("inexistente", {})
    _check(err, "herramienta desconocida devuelve error")


def probar_memoria(ws: Path) -> None:
    print("Memoria (corto y largo plazo):")
    corto = MemoriaCortoPlazo()
    corto.anadir("user", "hola")
    corto.anadir("assistant", "qué tal")
    _check(len(corto.historial()) == 2, "memoria corto plazo acumula la sesión")

    ruta = ws / "mem.json"
    largo = MemoriaLargoPlazo(ruta)
    largo.recordar("Para sumar cuadrados de primos uso ejecutar_python", "tactica")
    largo.recordar("Las reuniones de los lunes suelen retrasarse", "agenda")
    resultados = largo.buscar("cómo calcular suma de cuadrados de números primos", k=2)
    _check(resultados and "primos" in resultados[0][1]["texto"],
           f"base vectorial recupera el recuerdo correcto -> {resultados[0][1]['texto'] if resultados else None}")

    largo.registrar_error("obj X", "olvidó verificar el archivo", "releer con leer_archivo")
    contexto = largo.contexto_relevante("suma de cuadrados de primos")
    _check("primos" in contexto and "verificar" in contexto,
           "contexto_relevante combina recuerdos y errores")

    # Persistencia: una nueva instancia debe recuperar lo guardado.
    largo2 = MemoriaLargoPlazo(ruta)
    _check(len(largo2.recuerdos) == 2 and len(largo2.errores) == 1,
           "la memoria de largo plazo persiste entre instancias")


def main() -> None:
    print("=" * 60)
    print("PRUEBAS OFFLINE (sin API ni red)")
    print("=" * 60)
    with tempfile.TemporaryDirectory() as tmp:
        ws = Path(tmp)
        probar_manos(ws)
        probar_memoria(ws)
    print("\n✅ Todas las pruebas offline pasaron.")


if __name__ == "__main__":
    main()
