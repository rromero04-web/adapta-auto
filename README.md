# Adapta Auto — nueva web

Rediseño completo de [adapta-auto.com](https://www.adapta-auto.com/) con los datos actuales de la empresa. Es una web estática (HTML, CSS y JavaScript sin dependencias) que se puede alojar en cualquier servidor.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `index.html` | Página principal: vehículos en venta, categorías, quiénes somos, servicios, adaptaciones, proceso, preguntas frecuentes y contacto |
| `guia-vehiculo-adaptado.html` | Guía gratuita de vehículos adaptados |
| `assets/vehiculos.js` | **Catálogo de vehículos** (se edita aquí) |
| `assets/styles.css` | Estilos |
| `assets/main.js` | Menú, filtros del catálogo, ficha con galería de fotos, pestañas y formulario |

## Añadir o editar vehículos

Abra `assets/vehiculos.js` y copie un bloque. Cada vehículo admite marca, modelo, categoría, año, kilómetros, plazas, precio (o `null` para "Consultar"), características y una lista de fotos:

```js
fotos: ["assets/fotos/878-1.jpg", "assets/fotos/878-2.jpg"]
```

Si un vehículo no tiene fotos se muestra una ilustración según su tipo.

## Ver en local

```sh
python3 -m http.server 8000
# abrir http://localhost:8000
```
